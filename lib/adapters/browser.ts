import type { BaseConfig, AdapterCls } from './types'

class Browser implements AdapterCls {
  init(configData: BaseConfig) {}

  track(): void {}
}

const browser = new Browser()

export default browser
