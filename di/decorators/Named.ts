import { Ctor } from '../internal/types/Ctor.js'
import { DI } from '../DI.js'
import { configureBean } from './utils/beanUtils.js'

export function Named<T>(name: string | symbol) {
  return function (target: Ctor<T> | object, propertyKey?: string | symbol) {
    if (typeof target === 'function' && !propertyKey) {
      DI.configureDecoratedType<T>(target, { names: [name] })
      return
    }

    configureBean(target.constructor, propertyKey as string | symbol, { name })
  }
}
