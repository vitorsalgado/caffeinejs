import { Ctor } from '../types/Ctor.js'
import { DI } from './DI.js'
import { getParamTypes } from './utils/getParamTypes.js'

export function Injectable<T>(): ClassDecorator {
  return function (target) {
    const dependencies = getParamTypes(target)
    DI.configureInjectable(target as unknown as Ctor<T>, { dependencies })
  }
}
