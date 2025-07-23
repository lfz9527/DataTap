// content.js 相关行为
import { AirEnum } from './base'

// 事件类型
export class TRACK_EVENT extends AirEnum {
  // 页面事件
  static readonly PAGE_VIEW = new TRACK_EVENT('page_view', '页面访问')
  static readonly PAGE_LEAVE = new TRACK_EVENT('page_leave', '页面离开')

  // 点击事件
  static readonly CLICK_BUTTON = new TRACK_EVENT('click_button', '点击按钮')

  // 自定义事件
  static readonly CUSTOM_EVENT = new TRACK_EVENT('custom_event', '自定义事件')

  // 性能监控
  static readonly PERFORMANCE_FCP = new TRACK_EVENT(
    'performance_fcp',
    '首次内容绘制'
  )
  static readonly PERFORMANCE_LCP = new TRACK_EVENT(
    'performance_lcp',
    '最大内容绘制'
  )
  static readonly PERFORMANCE_CLS = new TRACK_EVENT(
    'performance_cls',
    '累计布局偏移'
  )

  // 错误事件
  static readonly ERROR_JS = new TRACK_EVENT(
    'error_js',
    'JS运行时错误（行、列、堆栈）'
  )
  static readonly ERROR_PROMISE = new TRACK_EVENT(
    'error_promise',
    'Promise 未捕获错误'
  )
  static readonly ERROR_STATIC = new TRACK_EVENT(
    'error_static',
    '静态资源加载错误'
  )
}

// 埋点缓存的key
export enum EventCacheKey {
  NET_EVENT_PILOT = 'net_event_pilot',
}
