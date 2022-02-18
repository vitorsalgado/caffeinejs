import { DI } from '../DI.js'
import { configureBean } from '../internal/utils/beanUtils.js'

export function Primary() {
  return function (target: Function | object, propertyKey?: string | symbol) {
    if (typeof target === 'function') {
      DI.configureType(target, { primary: true })
      return
    }

    configureBean(target.constructor, propertyKey!, {
      primary: true
    })
  }
}
