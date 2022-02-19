import { Binding } from '../Binding.js'
import { check } from '../internal/utils/check.js'
import { getInjectableMethods } from '../internal/utils/getInjectableMethods.js'
import { getInjectableProperties } from '../internal/utils/getInjectableProperties.js'
import { getParamTypes } from '../internal/utils/getParamTypes.js'
import { notNil } from '../internal/utils/notNil.js'
import { configureBean } from '../internal/utils/beanUtils.js'
import { TypeRegistrar } from '../internal/TypeRegistrar.js'

export function Bind<T>(
  options: Partial<Exclude<Binding<T>, 'id' | 'scopedProvider' | 'configuration' | 'cachedInstance'>>
) {
  notNil(options)
  check(typeof options === 'object', '@Bind parameter must be an object')
  check(options.id === undefined, 'Setting the binding id is forbidden')
  check(options.scopedProvider === undefined, 'Setting the scopedProvider here is forbidden')

  return function <TFunction extends Function>(target: TFunction | object, propertyKey?: string | symbol) {
    if (typeof target === 'function') {
      TypeRegistrar.configure<T>(target, {
        injections: getParamTypes(target),
        injectableProperties: getInjectableProperties(target),
        injectableMethods: getInjectableMethods(target),
        type: target,

        ...options,

        configuration: false
      } as Partial<Binding<T>>)

      return
    }

    configureBean(target.constructor, propertyKey!, {
      ...options,
      configuration: false
    } as Partial<Binding<T>>)
  }
}
