import { Ctor } from '../types/Ctor.js'
import { DI } from './DI.js'
import { getParamTypes } from './utils/getParamTypes.js'

export function Named<T>(name: string | symbol): ClassDecorator {
  return function (target) {
    const dependencies = getParamTypes(target as unknown as Ctor<T>)
    DI.configureInjectable(target as unknown as Ctor, {
      dependencies,
      qualifiers: [name],
      provider: { useClass: target as unknown as Ctor<T> }
    })
  }
}
