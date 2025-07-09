import {
  IframeActionDictionary,
  EnumKey,
  ClassConstructor,
  Json,
} from './types'

export class AirEnum<K extends EnumKey = string>
  implements IframeActionDictionary<K>
{
  // 枚举的值
  key: K
  // 枚举的描述
  label!: string

  constructor(key: K, label: string) {
    this.key = key
    this.label = label
  }

  // 获取label
  static getLabel(key: EnumKey) {
    return this.get(key)?.label
  }

  // 获取key
  getKey() {
    return this.key
  }

  // 查找一个枚举选项
  static get<K extends EnumKey, E extends AirEnum<K>>(
    this: ClassConstructor<E>,
    key: EnumKey
  ): E | null {
    return (this as Json).toArray().find((item: E) => item.key === key) || null
  }

  /**
   * 将枚举转为数组
   * @param this
   * @returns
   */
  static toArray<K extends EnumKey, E extends AirEnum<K>>(
    this: ClassConstructor<E>
  ): E[] {
    return Object.values(this).filter((item) => item instanceof this)
  }

  // 判断key 是否相等
  equalsKey(key: EnumKey): boolean {
    return this.key === key
  }
}

// 获取实例的类型
export type EnumInstances<T> = {
  [K in keyof T]: T[K] extends AirEnum<any> ? T[K] : never
}[keyof T]

// 获取实的 key 类型
export type EnumInstanceKeys<T> = EnumInstances<T>['key']
