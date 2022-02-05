import { DI } from '../DI.js'

export function Primary() {
  return function (target: Function | object, propertyKey?: string | symbol) {
    if (typeof target === 'function') {
      DI.configureInjectable(target, { primary: true })
      return
    }
  }
}
