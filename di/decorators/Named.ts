import { Identifier } from '../internal/types/Identifier.js'
import { Ctor } from '../internal/types/Ctor.js'
import { DI } from '../DI.js'
import { configureBean } from '../internal/utils/beanUtils.js'

export function Named<T>(name: Identifier) {
  return function (target: Ctor<T> | object, propertyKey?: string | symbol) {
    if (typeof target === 'function') {
      DI.configureType<T>(target, { names: [name] })
      return
    }

    configureBean(target.constructor, propertyKey!, { names: [name] })
  }
}
