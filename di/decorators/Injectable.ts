import { DI } from '../DI.js'
import { getParamTypes } from '../utils/getParamTypes.js'
import { getPropertyTypes } from '../utils/getPropertyTypes.js'

export function Injectable<T>(): ClassDecorator {
  return function (target) {
    DI.configureDecoratedType<T>(target, {
      dependencies: getParamTypes(target),
      propertyDependencies: getPropertyTypes(target)
    })
  }
}
