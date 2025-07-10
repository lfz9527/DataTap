import { UAParser, IResult } from 'ua-parser-js'
import FingerprintJS from '@fingerprintjs/fingerprintjs'

interface UARes extends IResult {
  fullOsName: string
}
// 解析user_agent
export const parserUA = (): UARes => {
  const parser = new UAParser()
  const uaData = parser.getResult()
  return {
    ...parser.getResult(),
    fullOsName: (uaData.os.name || '') + uaData.os.version,
  }
}

// 获取浏览器指纹
export const getFingerprint = async (): Promise<string> => {
  const fp = await FingerprintJS.load()
  const result = await fp.get()
  return result.visitorId
}

// 对象合并
export function deepMerge<T extends object, U extends object>(
  target: T,
  source: U
): T & U {
  const result: any = Array.isArray(target) ? [...target] : { ...target }

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceVal = (source as any)[key]
      const targetVal = (target as any)[key]

      if (isPlainObject(targetVal) && isPlainObject(sourceVal)) {
        result[key] = deepMerge(targetVal, sourceVal)
      } else {
        result[key] = sourceVal
      }
    }
  }

  return result
}

// 是否是对象
function isPlainObject(obj: any): obj is object {
  return Object.prototype.toString.call(obj) === '[object Object]'
}
