import { Ctor } from '../../types/Ctor.js'
import { DI } from '../DI.js'
import { ClassProvider } from '../internal/ClassProvider.js'
import { defineBean } from './utils/beanUtils.js'

export function Named<T>(name: string | symbol) {
  return function (target: Ctor<T> | object, method?: string | symbol) {
    if (typeof target === 'function' && !method) {
      DI.configureInjectable<T>(target, {
        names: [name],
        provider: new ClassProvider(target as Ctor)
      })
      return
    }

    defineBean(target.constructor, method as string | symbol, { name })
  }
}
