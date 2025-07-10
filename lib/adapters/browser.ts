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
      platform: this.PlatformInfo,
      userInfo,
      screen: this.TrackCore?.GenScreenInfo(),
      sdk: this.SDKInfo,
      ...TimerInfo,
      ...CommonInfo,
      ...data,
    }
  }

  // 记录PV
  trackPageView() {
    const payload = this.GenTrackPayload() as TrackPayload
    this.TrackCore?.reportTrack({
      event: {
        event_type: TRACK_EVENT.PAGE_VIEW.key,
        event_name: TRACK_EVENT.PAGE_VIEW.key,
        local_time_ms: payload.local_time!,
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
          event_type: TRACK_EVENT.PAGE_LEAVE.key,
          event_name: TRACK_EVENT.PAGE_LEAVE.key,
          local_time_ms: payload.local_time!,
        },
        payload,
      }
      if (!!navigator.sendBeacon) {
        this.TrackCore?.reportTrackBySendBeacon([eventData])
      } else {
        this.TrackCore?.reportTrackByImage([eventData])
      }
    }

    window.removeEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('beforeunload', handleBeforeUnload)
  }

  track(eventData: EventInfo, data: Record<string, any> = {}): void {
    const payload = this.GenTrackPayload(data) as TrackPayload

    const event = {
      event: {
        local_time_ms: payload.local_time!,
        ...eventData,
      },
      payload,
    }
    this.TrackCore?.reportTrack(event)
  }
}

const browser = new Browser()

export default browser
