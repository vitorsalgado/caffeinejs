import { Ctor } from '../../types/Ctor.js'
import { DI } from '../DI.js'
import { ClassProvider } from '../internal/ClassProvider.js'

export function Named<T>(name: string | symbol) {
  return function (target: Ctor<T>) {
    DI.configureInjectable<T>(target, {
      qualifiers: [name],
      provider: new ClassProvider(target)
    })
  }
}
