import { Ctor } from '../types/Ctor.js'
import { DI } from './DI.js'
import { getCtorParamTypes } from './utils/getCtorParamTypes.js'

export function Named<T>(name: string | symbol): ClassDecorator {
  return function (target) {
    const dependencies = getCtorParamTypes(target as unknown as Ctor<T>)
    DI.configureInjectable(target as unknown as Ctor, {
      dependencies,
      qualifiers: [name],
      provider: { useClass: target as unknown as Ctor<T> }
    })
  }
}
