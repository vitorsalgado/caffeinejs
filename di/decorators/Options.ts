import { configureBean } from '../internal/utils/beanUtils.js'
import { TypeRegistrar } from '../internal/TypeRegistrar.js'

export function Options<T>(options: unknown) {
  return function <TFunction extends Function>(target: TFunction | object, propertyKey?: string | symbol) {
    if (typeof target === 'function') {
      TypeRegistrar.configure<T>(target, { options })
      return
    }

    configureBean(target.constructor, propertyKey!, {
      options,
    })
  }
}
