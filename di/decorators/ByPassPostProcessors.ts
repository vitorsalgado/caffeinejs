import { TypeRegistrar } from '../internal/TypeRegistrar.js'
import { configureBean } from '../internal/utils/beanUtils.js'

export function ByPassPostProcessors() {
  return function (target: Function | object, propertyKey?: string | symbol) {
    if (typeof target === 'function') {
      TypeRegistrar.configure(target, { byPassPostProcessors: true })
      return
    }

    configureBean(target.constructor, propertyKey!, {
      byPassPostProcessors: true,
    })
  }
}
