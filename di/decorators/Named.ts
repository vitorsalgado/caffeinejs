import { Identifier } from '../internal/types/Identifier.js'
import { Ctor } from '../internal/types/Ctor.js'
import { configureBean } from '../internal/utils/beanUtils.js'
import { DiTypes } from '../internal/DiTypes.js'

export function Named<T>(name: Identifier) {
  return function (target: Ctor<T> | object, propertyKey?: string | symbol) {
    if (typeof target === 'function') {
      DiTypes.instance().configure<T>(target, { names: [name] })
      return
    }

    configureBean(target.constructor, propertyKey!, { names: [name] })
  }
}
