import { TRACK_EVENT } from '../constants'
import { EnumInstanceKeys } from '../constants/base'

export type AdaptersCons = 'browser' | 'browser-extensions'

export type ClientConst =
  | 'web'
  | 'web-extensions'
  | 'android'
  | 'ios'
  | 'desktop'

export interface StorageType {
  // 获取缓存
  get: (key?: string) => string
  // 设置缓存
  set: (value?: any, key?: string) => void
  // 移除缓存
  remove?: (key?: string) => void
}

export interface Config {
  // 自动执行 获取PV _ PL
  autoPVPL?: boolean
  // 是否开启debug模式
  debug?: boolean
  // 根链接,组成完整的上报请求接口
  baseUrl?: string
  // 上报链接
  src: string
  // 获取当前页面/浏览器链接
  getCurUrl?: () => string
  // 获取来源页面/浏览器链接
  getRefererUrl?: () => string
  // 是否开启批上报
  startMulTrack?: boolean
  // 自定义发送请求
  trackFn?: (data: Record<string, any>) => void
  // 自定义缓存处理
  storage?: StorageType
  // 来源平台
  client: ClientConst
  // 是否自动上传错误日志
  autoStackError?: boolean
  // 是否开启批上报
  mulTrack?: boolean
  // 触发上报的最大数量
  maxBufferSize?: number
  // 定时上传的间隔（ms）
  trackInterval?: number
}

export interface BaseConfig {
  // 埋点相关配置
  config?: Config
  // 应用id
  app_id: string
  app_version: string
  // 用户信息
  userInfo?: UserInfo
}

// 平台信息
export interface PlatformInfo {
  // 浏览器名称
  platformBrowser: string
  // 浏览器的语言
  platformBrowserLanguage?: string
  // 浏览器的 User-Agent
  platformUserAgent?: string
  // 操作系统名称
  platformOsName?: string
  // 网络类型
  platformNetworkType?: string
  // 设备唯一标识符，例如浏览器指纹或生成的 UUID（用于区分设备）
  platformDeviceId: string
  // 事件来源客户端类型，浏览器插件单独一个类型
  platformClientType: ClientConst
}

// 用户信息
export interface UserInfo {
  userId?: string
  userName?: string
  inviteCode?: string
}

// SDK 信息
export interface SDKInfo {
  sdkEversion: string
}

// 应用信息
export interface AppInfo {
  appId: string
  appVersion: number | string
}

// 屏幕信息
export interface ScreenInfo {
  screenWidth: number
  screenHeight: number
}

// 时间信息
export interface TimerInfo {
  // 实际上报时间
  localTime: number
  // 时区
  timeZone: string
}

// 常用字段
export interface CommonInfo {
  // 来源页面的 URL
  referer?: string
  // 当前页面的 URL
  currentUrl?: string
  [key: string]: any
}

export type TrackPayload = TimerInfo &
  CommonInfo & {
    userInfo: UserInfo
    sdk: SDKInfo
    screen: ScreenInfo
    platform: PlatformInfo
  }

// 事件信息
export interface EventInfo {
  // 事件id
  eventId?: string
  // 事件类型
  eventType: EnumInstanceKeys<typeof TRACK_EVENT>
  // 自定义事件类型
  cusEventType?: string
  // 事件名称
  eventName: string
  // 触发事件的本地时间
  localTimeMs?: number
  // 其他一些参数
  properties?: Record<string, any>
}
