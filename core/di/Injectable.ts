import { Ctor } from '../types/Ctor.js'
import { DI } from './DI.js'
import { getCtorParamTypes } from './utils/getCtorParamTypes.js'

export function Injectable<T>(): ClassDecorator {
  return function (target) {
    const dependencies = getCtorParamTypes(target)
    DI.configureInjectable(target as unknown as Ctor<T>, { dependencies })
  }
}
