import { EventCacheKey } from '../constants'
import { StorageType } from '../core/types'

type StorageInterface = StorageType | null

class StorageCls implements StorageType {
  private storage: StorageInterface = null

  constructor(storage: StorageInterface = null) {
    this.storage = storage || null
  }

  get(key: string = EventCacheKey.NET_EVENT_PILOT) {
    if (this.storage?.get) return this.storage?.get(key) || ''
    return sessionStorage.getItem(key) || ''
  }
  set(value: any, key: string = EventCacheKey.NET_EVENT_PILOT) {
    const data = typeof value === 'string' ? value : JSON.stringify(value)
    if (this.storage?.set) {
      this.storage?.set(key, data)
      return
    }
    sessionStorage.setItem(key, data)
  }
  remove(key: string = EventCacheKey.NET_EVENT_PILOT) {
    if (this.storage?.remove) {
      this.storage?.remove(key)
      return
    }
    sessionStorage.remove(key)
  }
}

export default StorageCls
