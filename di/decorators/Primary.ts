import { configureBean } from '../internal/utils/beanUtils.js'
import { DiTypes } from '../internal/DiTypes.js'

export function Primary() {
  return function (target: Function | object, propertyKey?: string | symbol) {
    if (typeof target === 'function') {
      DiTypes.instance().configure(target, { primary: true })
      return
    }

    configureBean(target.constructor, propertyKey!, {
      primary: true
    })
  }
}
