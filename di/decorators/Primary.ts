import { configureBean } from '../internal/utils/beanUtils.js'
import { TypeRegistrar } from '../internal/TypeRegistrar.js'

export function Primary() {
  return function (target: Function | object, propertyKey?: string | symbol) {
    if (typeof target === 'function') {
      TypeRegistrar.configure(target, { primary: true })
      return
    }

    configureBean(target.constructor, propertyKey!, {
      primary: true
    })
  }
}
