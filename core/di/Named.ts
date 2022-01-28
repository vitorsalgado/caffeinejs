import { Ctor } from '../types/Ctor.js'
import { DI } from './DI.js'

export function Named<T>(name: string | symbol): ClassDecorator {
  return function (target) {
    DI.configureInjectable<T>(target, {
      qualifiers: [name],
      provider: { useClass: target as unknown as Ctor }
    })
  }
}
