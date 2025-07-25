import { v4 as uuidv4 } from 'uuid'
import {
  TrackPayload,
  PlatformInfo,
  BaseConfig,
  UserInfo,
  SDKInfo,
  ScreenInfo,
  TimerInfo,
  CommonInfo,
  AppInfo,
  EventInfo,
} from './types'
import { parserUA, getFingerprint } from '../utils/common'
import StorageCls from '../utils/storage'
import { logger } from '../utils/logger'

interface ReportData {
  payload: TrackPayload
  event: EventInfo
}

class Core {
  private storage: StorageCls | null = null
  private conf: BaseConfig | null = null
  private event_buffer: ReportData[] = []
  private AppInfo: AppInfo = {
    appId: '',
    appVersion: '',
  }

  constructor(opt: BaseConfig) {
    this.storage = new StorageCls(opt.config?.storage || null)
    this.conf = opt
    this.AppInfo = {
      appId: opt.app_id,
      appVersion: opt.app_version,
    }
    logger.info('初始化埋点配置', JSON.stringify(opt))

    // 当页面销毁时，则一次性把剩余的数据都上报
    window.addEventListener('beforeunload', () => {
      if (this.event_buffer.length > 0) {
        this.flushEvents(true) // 用 sendBeacon
      }
    })
    // 初始化时把缓存剩余的数据给上报
    this.trackByCache()
  }

  // 获取app信息
  getAppInfo() {
    return this.AppInfo
  }

  // 获取完整上报地址
  getFullReportUrl(): string {
    if (!this.conf) return ''
    const baseUrl = this.conf.config?.baseUrl || ''
    const src = this.conf.config?.src || ''

    if (!src) {
      throw new Error('请填写上报地址')
    }

    return baseUrl + src
  }

  // 构建常用参数
  GenCommInfo(): CommonInfo {
    const getCurUrl = this.conf?.config?.getCurUrl
    const getRefererUrl = this.conf?.config?.getRefererUrl
    return {
      referer: getRefererUrl ? getRefererUrl() : document.referrer,
      currentUrl: getCurUrl?.() ?? window.location.href,
    }
  }

  // 时间信息
  GenTimerInfo(): TimerInfo {
    return {
      localTime: Date.now(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown',
    }
  }

  // 生成屏幕信息
  GenScreenInfo(): ScreenInfo {
    return {
      // 浏览器实际宽度
      screenWidth: window.innerWidth,
      // 浏览器实际高度
      screenHeight: window.innerHeight,
    }
  }

  // 生成用户信息
  GenUserInfo(): UserInfo {
    return {
      ...(this.conf?.userInfo ?? {}),
    }
  }

  // 生成sdk信息
  GenSdkInfo(): SDKInfo {
    return {
      sdkEversion: __SDK_VERSION__,
    }
  }

  // 生成平台信息
  async GenPlatformInfo(): Promise<PlatformInfo> {
    const client = this.conf?.config?.client!
    const UA = parserUA()
    const plaInfo = {
      platformBrowser: UA.browser.name || 'unknown',
      platformBrowserLanguage: navigator?.language || 'unknown',
      platformUserAgent: UA.ua || navigator.userAgent,
      platformOsName: UA.fullOsName,
      platformNetworkType:
        (navigator as any).connection?.effectiveType || 'unknown',
      platformDeviceId: await getFingerprint(),
      platformClientType: client,
    }

    return plaInfo
  }

  // 接口请求上报请求
  async reportTrack(data: ReportData): Promise<void> {
    this.event_buffer.push(data)

    // 不管有没有批量上报,事件长度超出都直接上传
    if (this.event_buffer.length >= this.conf?.config?.maxBufferSize!) {
      this.flushEvents()
      return
    }

    // 如果开启了批量上传则，默认每5秒上传一次
    if (this.conf?.config?.startMulTrack) {
      setInterval(() => {
        if (this.event_buffer.length > 0) {
          this.flushEvents()
        }
      }, this.conf?.config?.trackInterval)
    } else {
      // 没开启则实时上传
      this.flushEvents()
    }
  }

  // 主要用于页面离开，或者会使请求中断的上报
  reportLastTrack(event: ReportData[]) {
    if (!!navigator.sendBeacon) {
      this.reportTrackBySendBeacon(event)
    } else {
      this.reportTrackByImage(event)
    }
  }

  // 通过图片上报数据
  reportTrackByImage(event: ReportData[]) {
    const url = this.getFullReportUrl()
    if (!url) {
      throw new Error('请填写上报地址')
    }
    const data = this.GenTrackData(event)
    const jsonData = JSON.stringify(data)
    logger.info('track', jsonData)
    const img = new Image()
    img.src = `${url}?event=${encodeURIComponent(JSON.stringify(data))}`
  }

  // 通过 navigator.sendBeacon 上报数据
  reportTrackBySendBeacon(event: ReportData[]) {
    const url = this.getFullReportUrl()
    if (!url) {
      throw new Error('请填写上报地址')
    }

    const data = this.GenTrackData(event)
    const jsonData = JSON.stringify(data)
    logger.info('track', jsonData)
    navigator.sendBeacon(url, jsonData)
  }

  // 上报数据
  flushEvents(useBeacon: boolean = false) {
    const events = [...this.event_buffer]
    if (useBeacon) {
      this.reportLastTrack(events)
    } else {
      this.eventFetch()
    }
  }
  // 事件函数
  async eventFetch() {
    let cacheData: ReportData[] = []

    try {
      const url = this.getFullReportUrl()
      if (!url) {
        throw new Error('请填写上报地址')
      }
      const eventsToSend = [...this.event_buffer]
      this.event_buffer = []
      this.event_buffer.length = 0

      const data = this.GenTrackData(eventsToSend)
      console.log('eventsToSend', data)
      // 如果有自定义则执行自定义埋点上报
      if (this.conf?.config?.trackFn) {
        this.conf?.config?.trackFn(data)
        return
      }

      cacheData = data
      this.updateTrackDataCache(data)
      const body = JSON.stringify(data)
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      })

      if (!response.ok) {
        logger.error(
          '埋点上报失败:',
          JSON.stringify({
            status: response.status,
            statusText: response.statusText,
          })
        )
        throw new Error('track fail')
      }

      const result = await response.json()

      if (result?.code !== 10000) {
        logger.error(
          '埋点上报失败:',
          JSON.stringify({
            status: response.status,
            statusText: response.statusText,
          })
        )
        throw new Error('track fail')
      }
      logger.success('埋点上报成功', body)

      // 上报成功则删除缓存
      const sucIds = data.map((v) => v.event.eventId)
      this.deleteCacheTrackData(sucIds)
    } catch (error) {
      logger.error('埋点上报异常:', JSON.stringify(error))
    }
  }

  // 把缓存的数据给上报
  trackByCache() {
    const cacheTrack = this.storage?.get()
      ? JSON.parse(this.storage?.get())
      : []
    if (cacheTrack.length === 0) return
    this.event_buffer = [...this.event_buffer, ...cacheTrack]
    this.eventFetch()
  }

  // 更新缓存
  updateTrackDataCache(data: ReportData[]) {
    const cacheTrack = this.storage?.get()
      ? JSON.parse(this.storage?.get())
      : []
    this.storage?.set([...cacheTrack, ...data])
  }
  // 根据id 删除缓存
  deleteCacheTrackData(ids: string[]) {
    console.log(ids)

    const cacheTrack = (
      this.storage?.get() ? JSON.parse(this.storage?.get()) : []
    ) as ReportData[]
    if (cacheTrack.length === 0) return
    const list = cacheTrack.filter(
      (t) => t.event.eventId && !ids.includes(t.event.eventId)
    )
    this.storage?.set(list)
    return list
  }

  // 构建上报数据
  GenTrackData(data: ReportData[]) {
    return data.map((eData) => {
      return {
        ...eData,
        event: {
          ...eData.event,
          // 构建上报id
          eventId: uuidv4(),
        },
        payload: {
          ...eData.payload,
          // 更新实际上报时间
          ...this.GenTimerInfo(),
        },
      }
    })
  }
}

export default Core
