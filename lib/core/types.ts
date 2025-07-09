import { TRACK_EVENT } from '../constants'
import { EnumInstanceKeys } from '../constants/base'

export interface TrackPayload {
  // 用户信息
  userId: string
  userName?: string

  // SDK 信息
  sdk_version: string

  // 平台信息
  // 设备平台名称，例如 "iPhone", "MacBookPro", "Windows PC"
  platform: string
  // 设备或系统的版本号，例如 "16.5.1", "Windows 11"
  platform_version: string
  // 当前设备
  platform_language?: string
  // 浏览器名称
  browser: string
  // 浏览器的语言
  browser_language?: string
  // 浏览器的 User-Agent
  user_agent?: string
  // 操作系统名称
  os_name?: string
  // 网络类型
  network_type?: string
  // 设备唯一标识符，例如浏览器指纹或生成的 UUID（用于区分设备）
  device_id: string
  // 事件来源客户端类型，浏览器插件单独一个类型
  client_type: 'web' | 'web-extensions' | 'android' | 'ios' | 'desktop'

  // 屏幕信息
  screen_width: number
  screen_height: number

  // 时间信息
  // 当前时间信息
  local_time: number
  // 时区
  time_zone: string

  // 页面上下文
  // 来源页面的 URL
  referer?: string
  // 当前页面的 URL
  current_url?: string
}

// 事件信息
export interface EventInfo {
  // 事件类型
  event_type: EnumInstanceKeys<typeof TRACK_EVENT>
  // 自定义事件类型
  cus_event_type?: string
  // 事件名称
  event_name: string
  // 触发事件的本地时间
  local_time_ms: number
  // 其他一些参数
  properties?: Record<string, any>
}
