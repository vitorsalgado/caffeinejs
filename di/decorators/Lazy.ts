import { DI } from '../DI.js'
import { configureBean } from '../internal/utils/beanUtils.js'

export function Lazy<T>(lazy = true) {
  return function <TFunction extends Function>(target: TFunction | object, propertyKey?: string | symbol) {
    if (typeof target === 'function') {
      DI.configureType<T>(target, { lazy })
      return
    }

    configureBean(target.constructor, propertyKey!, {
      lazy
    })
  }
}
