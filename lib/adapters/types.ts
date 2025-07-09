import { TrackPayload } from '../core/types'

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

export interface BaseConfig {
  // 埋点相关配置
  config?: Config
  // 应用id
  app_id: string
  // 用户信息
  userInfo?: {
    userId: TrackPayload['userId']
    userName?: TrackPayload['userName']
  }
}

// 适配器通用接口
export interface AdapterCls {
  init(configData: BaseConfig): void
  track(): void
}
