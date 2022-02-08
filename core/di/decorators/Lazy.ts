import { DI } from '../DI.js'
import { getParamTypes } from '../utils/getParamTypes.js'
import { configureBean } from './utils/beanUtils.js'

export function Lazy<T>(lazy = true) {
  return function <TFunction extends Function>(target: TFunction | object, propertyKey?: string | symbol) {
    if (typeof target === 'function') {
      DI.configureDecoratedType<T>(target, { dependencies: getParamTypes(target), lazy })
      return
    }

    configureBean(target.constructor, propertyKey!, {
      dependencies: getParamTypes(target, propertyKey),
      lazy
    })
  }
}
