import { configureBean } from '../internal/utils/beanUtils.js'
import { DiTypes } from '../internal/DiTypes.js'

export function Lazy<T>(lazy = true) {
  return function <TFunction extends Function>(target: TFunction | object, propertyKey?: string | symbol) {
    if (typeof target === 'function') {
      DiTypes.instance().configure<T>(target, { lazy })
      return
    }

    configureBean(target.constructor, propertyKey!, {
      lazy
    })
  }
}
