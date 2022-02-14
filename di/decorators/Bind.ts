import { Binding } from '../Binding.js'
import { DI } from '../DI.js'
import { check } from '../utils/check.js'
import { getInjectableMethods } from '../utils/getInjectableMethods.js'
import { getParamTypes } from '../utils/getParamTypes.js'
import { getInjectableProperties } from '../utils/getInjectableProperties.js'
import { notNil } from '../utils/notNil.js'
import { configureBean } from './utils/beanUtils.js'

export function Bind<T>(
  options: Partial<Exclude<Binding<T>, 'namespace' | 'scope' | 'scopedProvider' | 'configuration' | 'instance'>>
) {
  notNil(options)
  check(typeof options === 'object', '@Bind parameter must be an object.')

  return function <TFunction extends Function>(target: TFunction | object, propertyKey?: string | symbol) {
    if (typeof target === 'function') {
      DI.configureType<T>(target, {
        injections: getParamTypes(target),
        injectableProperties: getInjectableProperties(target),
        injectableMethods: getInjectableMethods(target),
        ...options
      })
      return
    }

    configureBean(target.constructor, propertyKey!, {
      ...options
    })
  }
}
