import { DI } from '../DI.js'

export function Primary() {
  return function (target: Function | object, _propertyKey?: string | symbol) {
    DI.configureInjectable(target, { primary: true })
  }
}
