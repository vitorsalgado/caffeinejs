import { DI } from '../DI.js'
import { configureBean } from '../internal/utils/beanUtils.js'

export function Options<T>(options: unknown) {
  return function <TFunction extends Function>(target: TFunction | object, propertyKey?: string | symbol) {
    if (typeof target === 'function') {
      DI.configureType<T>(target, { options })
      return
    }

    configureBean(target.constructor, propertyKey!, {
      options
    })
  }
}
