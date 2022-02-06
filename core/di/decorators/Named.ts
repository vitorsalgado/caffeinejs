import { Ctor } from '../../types/Ctor.js'
import { DI } from '../DI.js'
import { ClassProvider } from '../internal/ClassProvider.js'
import { configureBean } from './utils/beanUtils.js'

export function Named<T>(name: string | symbol) {
  return function (target: Ctor<T> | object, propertyKey?: string | symbol) {
    if (typeof target === 'function' && !propertyKey) {
      DI.configureInjectable<T>(target, {
        names: [name],
        provider: new ClassProvider(target as Ctor)
      })
      return
    }

    configureBean(target.constructor, propertyKey as string | symbol, { name })
  }
}
