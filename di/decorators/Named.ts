import { configureBean } from '../internal/utils/beanUtils.js'
import { TypeRegistrar } from '../internal/TypeRegistrar.js'
import { Ctor } from '../internal/types.js'
import { Identifier } from '../internal/types.js'
import { configureInjectionMetadata } from '../internal/utils/configureInjectionMetadata.js'

export function Named<T>(name: Identifier) {
  return function (
    target: Ctor<T> | object,
    propertyKey?: string | symbol,
    parameterIndex?: number | PropertyDescriptor,
  ) {
    // Parameter
    if (typeof parameterIndex === 'number') {
      return configureInjectionMetadata({ token: name })(target, propertyKey!, parameterIndex)
    }

    // Class
    if (typeof target === 'function') {
      TypeRegistrar.configure<T>(target, { names: [name] })
      return
    }

    // Method
    configureBean(target.constructor, propertyKey!, { names: [name] })
  }
}
