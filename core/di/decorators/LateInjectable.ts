import { Ctor } from '../../types/Ctor.js'
import { DI } from '../DI.js'
import { getParamTypes } from '../utils/getParamTypes.js'

export function LateInjectable<T>() {
  return function (target: Ctor<T>) {
    DI.configureInjectable<T>(target, { dependencies: getParamTypes(target), late: true })
  }
}
