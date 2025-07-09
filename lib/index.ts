import { logger } from './utils/logger'

const adapters = {
  browser: () => import('./adapters/browser'),
  'browser-extensions': () => import('./adapters/browser-extensions'),
}

class TrackerSDK {
  init() {
    logger.info('初始化')
  }

  track() {}
}

const Tracker = new TrackerSDK()

export default Tracker

// 让 UMD 也挂到 window，方便 CDN 直接使用
if (typeof window !== 'undefined') {
  ;(window as any).Tracker = Tracker
}
