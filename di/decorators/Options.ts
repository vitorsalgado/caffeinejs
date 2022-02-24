import { configureBean } from '../internal/utils/beanUtils.js'
import { TypeRegistrar } from '../internal/TypeRegistrar.js'
import { getBeanConfiguration } from '../internal/utils/beanUtils.js'

export function Options<O extends object, T = unknown>(options: O) {
  return function <TFunction extends Function>(target: TFunction | object, propertyKey?: string | symbol) {
    if (typeof target === 'function') {
      const injectable = TypeRegistrar.get(target)

      if (injectable && injectable.options) {
        options = { ...injectable.options, ...options }
      }

      TypeRegistrar.configure<T>(target, { options })
      return
    }

    const config = getBeanConfiguration(target.constructor, propertyKey!)

    if (config && config.options) {
      options = { ...config.options, ...options }
    }

    configureBean(target.constructor, propertyKey!, {
      options,
    })
  }
}
