import { configureBean } from '../internal/utils/beanUtils.js'
import { DiTypes } from '../internal/DiTypes.js'
import { Ctor } from '../internal/types.js'
import { Identifier } from '../internal/types.js'

export function Named<T>(name: Identifier) {
  return function (target: Ctor<T> | object, propertyKey?: string | symbol) {
    if (typeof target === 'function') {
      DiTypes.instance().configure<T>(target, { names: [name] })
      return
    }

    configureBean(target.constructor, propertyKey!, { names: [name] })
  }
}
