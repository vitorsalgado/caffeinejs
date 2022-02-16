import { Binding } from '../Binding.js'
import { DI } from '../DI.js'
import { check } from '../utils/check.js'
import { getInjectableMethods } from '../utils/getInjectableMethods.js'
import { getInjectableProperties } from '../utils/getInjectableProperties.js'
import { getParamTypes } from '../utils/getParamTypes.js'
import { notNil } from '../utils/notNil.js'
import { configureBean } from './utils/beanUtils.js'

export function Bind<T>(
  options: Partial<Exclude<Binding<T>, 'id' | 'namespace' | 'scopedProvider' | 'configuration' | 'cachedInstance'>>
) {
  notNil(options)
  check(typeof options === 'object', '@Bind parameter must be an object')
  check(options.id === undefined, 'Setting the binding id is forbidden')
  check(typeof options.scopedProvider === undefined, 'Setting the scopedProvider here is forbidden')

  return function <TFunction extends Function>(target: TFunction | object, propertyKey?: string | symbol) {
    if (typeof target === 'function') {
      DI.configureType<T>(target, {
        injections: getParamTypes(target),
        injectableProperties: getInjectableProperties(target),
        injectableMethods: getInjectableMethods(target),
        type: target,

        ...options,

        configuration: false,
        cachedInstance: undefined
      } as Partial<Binding<T>>)

      return
    }

    configureBean(target.constructor, propertyKey!, {
      ...options,

      configuration: false,
      cachedInstance: undefined
    } as Partial<Binding<T>>)
  }
}
