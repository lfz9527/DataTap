import { logger } from './utils/logger'
import type { BaseConfig, AdaptersCons, AdapterCls } from './adapters/types'
import Browser from './adapters/browser'

// 根据不同的场景适配不同的埋点事件
const adapters: Record<AdaptersCons, any> = {
  browser: Browser,
}

class TrackerSDK {
  // 当前适配器
  private actAdapter: AdapterCls | null = null

  init(configData: BaseConfig) {
    const platform = configData?.config?.platform || 'browser'
    const startDebug = configData?.config?.debug

    logger.init({ debug: startDebug })
    logger.info(`init ${platform} tracker`)

    this.actAdapter = adapters[platform]
    this.actAdapter?.init(configData)
  }
  track() {
    this.actAdapter?.track()
  }
}

const Tracker = new TrackerSDK()

export default Tracker

// 让 UMD 也挂到 window，方便 CDN 直接使用
if (typeof window !== 'undefined') {
  ;(window as any).Tracker = Tracker
}
