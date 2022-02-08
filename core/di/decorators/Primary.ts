import { DI } from '../DI.js'
import { getParamTypes } from '../utils/getParamTypes.js'
import { configureBean } from './utils/beanUtils.js'

export function Primary() {
  return function (target: Function | object, propertyKey?: string | symbol) {
    if (typeof target === 'function') {
      DI.configureDecoratedType(target, { primary: true })
      return
    }

    configureBean(target.constructor, propertyKey!, {
      dependencies: getParamTypes(target, propertyKey),
      primary: true
    })
  }
}
