import { configureBean } from '../internal/utils/beanUtils.js'
import { DiTypes } from '../internal/DiTypes.js'

export function Options<T>(options: unknown) {
  return function <TFunction extends Function>(target: TFunction | object, propertyKey?: string | symbol) {
    if (typeof target === 'function') {
      DiTypes.instance().configure<T>(target, { options })
      return
    }

    configureBean(target.constructor, propertyKey!, {
      options
    })
  }
}
