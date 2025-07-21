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
import { logger } from '../utils/logger'

interface ReportData {
  payload: TrackPayload
  event: EventInfo
}

class Core {
  private conf: BaseConfig | null = null
  private event_buffer: ReportData[] = []
  private AppInfo: AppInfo = {
    appId: '',
    appVersion: '',
  }

  constructor(opt: BaseConfig) {
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

    const data = JSON.stringify(event)
    logger.info('track', data)
    const img = new Image()
    img.src = `${url}?event=${encodeURIComponent(JSON.stringify(data))}`
  }

  // 通过 navigator.sendBeacon 上报数据
  reportTrackBySendBeacon(event: ReportData[]) {
    const url = this.getFullReportUrl()
    if (!url) {
      throw new Error('请填写上报地址')
    }
    const data = JSON.stringify(event)
    logger.info('track', data)
    navigator.sendBeacon(url, data)
  }

  // 上报数据
  flushEvents(useBeacon: boolean = false) {
    const events = [...this.event_buffer]
    if (useBeacon) {
      if (!!navigator.sendBeacon) {
        this.reportTrackBySendBeacon(events)
      } else {
        this.reportTrackByImage(events)
      }
    } else {
      this.eventFetch()
    }
  }
  // 事件函数
  eventFetch() {
    try {
      const url = this.getFullReportUrl()
      if (!url) {
        throw new Error('请填写上报地址')
      }
      const eventsToSend = [...this.event_buffer]
      this.event_buffer = []
      this.event_buffer.length = 0

      // 更新实际上报时间
      const data = eventsToSend.map((eData) => {
        return {
          ...eData,
          payload: {
            ...eData.payload,
            ...this.GenTimerInfo(),
          },
        }
      })
      console.log('eventsToSend', data)

      // 如果有自定义则执行自定义埋点上报
      if (this.conf?.config?.trackFn) {
        this.conf?.config?.trackFn(data)
        return
      }

      const body = JSON.stringify(data)
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      })
        .then((response) => {
          if (!response.ok) {
            logger.error(
              '埋点上报失败:',
              JSON.stringify({
                status: response.status,
                statusText: response.statusText,
              })
            )
          } else {
            logger.success('埋点上报成功', body)
          }
        })
        .catch((error) => {
          logger.error('埋点上报异常:', JSON.stringify(error))
        })
    } catch (error) {
      logger.error('埋点上报异常:', JSON.stringify(error))
    }
  }
}

export default Core
