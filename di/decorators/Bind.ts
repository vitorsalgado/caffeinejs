import { Binding } from '../Binding.js'
import { DI } from '../DI.js'
import { getMethodInjections } from '../utils/getMethodInjections.js'
import { getParamTypes } from '../utils/getParamTypes.js'
import { getPropertyTypes } from '../utils/getPropertyTypes.js'
import { configureBean } from './utils/beanUtils.js'

export function Bind<T>(
  options: Partial<Exclude<Binding<T>, 'namespace' | 'scope' | 'scopedProvider' | 'configuration' | 'instance'>>
) {
  return function <TFunction extends Function>(target: TFunction | object, propertyKey?: string | symbol) {
    if (typeof target === 'function') {
      DI.configureDecoratedType<T>(target, {
        dependencies: getParamTypes(target),
        propertyDependencies: getPropertyTypes(target),
        methodInjections: getMethodInjections(target),
        ...options
      })
      return
    }

    configureBean(target.constructor, propertyKey!, {
      ...options
    })
  }
}
