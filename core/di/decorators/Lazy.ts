import { DI } from '../DI.js'
import { getParamTypes } from '../utils/getParamTypes.js'

export function Lazy<T>(lazy = true): ClassDecorator {
  return function (target) {
    DI.configureInjectable<T>(target, { dependencies: getParamTypes(target), lazy })
  }
}
