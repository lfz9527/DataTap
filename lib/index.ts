import { logger } from './utils/logger'
import Browser from './adapters/browser'
import BrowserExtensions from './adapters/browser-extensions'

// 根据不同的场景适配不同的埋点事件
const adapters = {
  browser: Browser,
  'browser-extensions': BrowserExtensions,
}

class TrackerSDK {
  init() {
    logger.info('初始化', JSON.stringify(adapters))
  }

  track() {}
}

const Tracker = new TrackerSDK()

export default Tracker

// 让 UMD 也挂到 window，方便 CDN 直接使用
if (typeof window !== 'undefined') {
  ;(window as any).Tracker = Tracker
}
