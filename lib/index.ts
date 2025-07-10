import { logger } from './utils/logger'
import type { AdapterCls } from './adapters/types'
import type { AdaptersCons, BaseConfig } from './core/types'
import Browser from './adapters/browser'
import { deepMerge } from './utils/common'

// 根据不同的场景适配不同的埋点事件
const adapters: Record<AdaptersCons, any> = {
  browser: Browser,
  'browser-extensions': Browser,
}

const initConfig = {
  config: {
    autoPVPL: true,
    mulTrack: false,
    maxBufferSize: 10,
    trackInterval: 5000,
    autoStackError: true,
  },
}

class TrackerSDK {
  // 当前适配器
  public Tracker: AdapterCls | null = null

  init(adapter: AdaptersCons, configData: BaseConfig) {
    const mergeConf = deepMerge(configData, initConfig)
    const startDebug = configData?.config?.debug
    logger.init({ debug: startDebug })
    logger.info(`init ${adapter} tracker`)
    this.Tracker = adapters[adapter]
    this.Tracker?.init(mergeConf)
  }
  track(event: any = {}, data: any = {}) {
    this.Tracker?.track(event, data)
  }
}

const trackerSdk = new TrackerSDK()

export default trackerSdk

// 让 UMD 也挂到 window，方便 CDN 直接使用
if (typeof window !== 'undefined') {
  ;(window as any).TrackerSDK = trackerSdk
}
