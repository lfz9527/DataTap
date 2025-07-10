import { BaseConfig, EventInfo } from '../core/types'

// 适配器通用接口
export interface AdapterCls {
  init(configData: BaseConfig): void
  track(eventData: EventInfo, data?: Record<string, any>): void
}
