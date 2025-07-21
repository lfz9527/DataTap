// 适配浏览器 埋点

import type { AdapterCls } from './types'
import type {
  PlatformInfo,
  BaseConfig,
  UserInfo,
  SDKInfo,
  TrackPayload,
  EventInfo,
} from '../core/types'
import { TRACK_EVENT } from '../constants/index'
import Core from '../core'

class Browser implements AdapterCls {
  private config: BaseConfig | null = null
  private TrackCore: Core | null = null
  private PlatformInfo: PlatformInfo | null = null
  private UserInfo: UserInfo | null = null
  private SDKInfo: SDKInfo | null = null
  private ErrorTrackBuffer: any[] = []

  // 设备信息
  async init(config: BaseConfig) {
    this.config = config
    this.TrackCore = new Core(config)

    // 初始化的时候就直接获取设备信息
    this.PlatformInfo = await this.TrackCore?.GenPlatformInfo()!
    this.SDKInfo = this.TrackCore?.GenSdkInfo()
    this.UserInfo = this.TrackCore?.GenUserInfo()

    if (config.config?.autoPVPL) {
      this.trackPageView()
      this.trackPageLeave()
    }
  }

  // 构建数据上报需要的数据
  GenTrackPayload(data: Record<string, any> = {}) {
    const TimerInfo = this.TrackCore?.GenTimerInfo()
    const CommonInfo = this.TrackCore?.GenCommInfo()

    const userInfo = {
      ...this.UserInfo,
      ...(data.userInfo ?? {}),
    }

    return {
      ...this.PlatformInfo,
      ...userInfo,
      ...this.TrackCore?.GenScreenInfo(),
      ...this.SDKInfo,
      ...TimerInfo,
      ...CommonInfo,
      ...data,
      ...this.TrackCore?.getAppInfo(),
    }
  }

  // 记录PV
  trackPageView() {
    const payload = this.GenTrackPayload() as TrackPayload
    this.TrackCore?.reportTrack({
      event: {
        eventType: TRACK_EVENT.PAGE_VIEW.key,
        eventName: TRACK_EVENT.PAGE_VIEW.key,
        localTimeMs: payload.localTime!,
      },
      payload,
    })
  }

  // 记录PL
  trackPageLeave() {
    const handleBeforeUnload = () => {
      const payload = this.GenTrackPayload() as TrackPayload
      const eventData = {
        event: {
          eventType: TRACK_EVENT.PAGE_VIEW.key,
          eventName: TRACK_EVENT.PAGE_VIEW.key,
          localTimeMs: payload.localTime!,
        },
        payload,
      }
      const eventListData = [eventData]
      this.TrackCore?.reportLastTrack(eventListData)
    }

    window.removeEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('beforeunload', handleBeforeUnload)
  }

  track(eventData: EventInfo, data: Record<string, any> = {}): void {
    const payload = this.GenTrackPayload(data) as TrackPayload
    const properties = eventData.properties || {}

    const event = {
      event: {
        localTimeMs: payload.localTime!,
        ...eventData,
      },
      payload: {
        ...payload,
        ...properties,
      },
    }
    this.TrackCore?.reportTrack(event)
  }
  // 错误异常
  trackError() {
    let eventData = {}
    const _this = this

    // JS运行时错误（行、列、堆栈）
    window.onerror = function (message, source, lineno, colno, error) {
      const errorInfo = {
        message: message?.toString(),
        source: source,
        lineno,
        colno,
        stack: error?.stack || null,
      }
      const payload = _this.GenTrackPayload()

      eventData = {
        eventType: TRACK_EVENT.ERROR_JS.key,
        eventName: TRACK_EVENT.ERROR_JS.key,
        localTimeMs: payload.localTime!,
        properties: errorInfo,
      }
      _this.ErrorTrackBuffer.push({
        payload,
        event: eventData,
      })
    }

    // 静态资源加载错误
    window.addEventListener(
      'error',
      (event) => {
        // 资源加载失败：<script> <img> <link>
        const target = event.target as HTMLElement
        if (
          target &&
          (target.tagName === 'SCRIPT' ||
            target.tagName === 'IMG' ||
            target.tagName === 'LINK')
        ) {
          const errorInfo = {
            tagName: target.tagName,
            src: (target as any).src || (target as any).href,
          }
          const payload = _this.GenTrackPayload()

          eventData = {
            eventType: TRACK_EVENT.ERROR_STATIC.key,
            eventName: TRACK_EVENT.ERROR_STATIC.key,
            localTime: payload.localTime!,
            properties: errorInfo,
          }
          _this.ErrorTrackBuffer.push({
            payload,
            event: eventData,
          })
        }
      },
      true // 资源加载错误必须捕获阶段监听
    )

    // Promise 未捕获错误
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason
      const errorInfo = {
        message: error?.message || error?.toString(),
        stack: error?.stack || null,
      }
      const payload = _this.GenTrackPayload()

      eventData = {
        event_type: TRACK_EVENT.ERROR_PROMISE.key,
        event_name: TRACK_EVENT.ERROR_PROMISE.key,
        localTimeMs: payload.localTime!,
        properties: errorInfo,
      }
      _this.ErrorTrackBuffer.push({
        payload,
        event: eventData,
      })
    })

    // 错误日志上传， 单独处理
    const handleBeforeUnload = () => {
      if (this.ErrorTrackBuffer.length === 0) return
      this.TrackCore?.reportLastTrack(this.ErrorTrackBuffer)
    }

    // 自动上传入职
    if (this.config?.config?.autoStackError) {
      // 因为错误有可能一次性出现很多个，所以 定时去发送那个错误数据
      setInterval(() => {
        if (this.ErrorTrackBuffer.length > 0) {
          const tracks = [...this.ErrorTrackBuffer]
          tracks.forEach((t) => {
            this.TrackCore?.reportTrack(t)
          })
          this.ErrorTrackBuffer = []
          this.ErrorTrackBuffer.length = 0
        }
      }, 1000)
    } else {
      handleBeforeUnload()
    }

    window?.removeEventListener('beforeunload', handleBeforeUnload)
    window?.addEventListener('beforeunload', handleBeforeUnload)
  }
}

const browser = new Browser()

export default browser
