import { DI } from '../DI.js'
import { getParamTypes } from '../utils/getParamTypes.js'

export function Injectable<T>(): ClassDecorator {
  return function (target) {
    DI.configureInjectable<T>(target, { dependencies: getParamTypes(target) })
  }
}
