import { Ctor } from '../../types/Ctor.js'
import { DI } from '../DI.js'

export function Named<T>(name: string | symbol) {
  return function (target: Ctor<T>) {
    DI.configureInjectable<T>(target, {
      qualifiers: [name],
      provider: { useClass: target }
    })
  }
}
