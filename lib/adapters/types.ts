export type AdaptersCons = 'browser'

export interface Storage {
  // 获取缓存
  get: <T>(key: string) => T | null
  // 设置缓存
  set: (key: string, value: any) => void
  // 移除缓存
  remove?: (key: string) => void
}

export interface Config {
  // 是否开启debug模式
  debug?: boolean
  // 根链接,组成完整的上报请求接口
  baseUrl?: string
  // 上报链接
  url: string
  // 获取当前页面/浏览器链接
  getPageUrlFn?: () => void
  // 是否开启批上报
  startMulTrack?: boolean
  // 自定义发送请求
  trackFn?: () => void
  // 自定义缓存处理
  storage?: Storage
  // 平台
  platform: AdaptersCons
}

export interface AppInfo {
  // 系统id
  app_id: string
  // 浏览器
  browser?: string
  // 浏览器版本
  browser_version?: string
  // 当前浏览器语言
  browser_language?: string
}

export interface UserInfo {
  // 用户唯一id
  userId: number
  // 用户名
  userName?: string
}
export interface SDKInfo {
  // sdk版本
  sdk_version: string
}

export interface BaseConfig {
  // 埋点相关配置
  config?: Config
  // 系统信息
  appInfo?: AppInfo
  // 用户信息
  userInfo?: UserInfo
  // sdk信息
  sdkInfo?: SDKInfo
}

// 上报配置
export interface TrackConfig {
  // 上报事件id 必须是唯一值
  event_id: string
  config?: {
    pageUrl?: string
    appInfo?: AppInfo
    userInfo?: UserInfo
  }
}

// 适配器通用接口
export interface AdapterCls {
  init(configData: BaseConfig): void
  track(): void
}
