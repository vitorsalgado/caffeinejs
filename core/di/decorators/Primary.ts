import { DI } from '../DI.js'
import { getParamTypes } from '../utils/getParamTypes.js'
import { defineBean } from './utils/beanUtils.js'

export function Primary() {
  return function (target: Function | object, propertyKey?: string | symbol) {
    if (typeof target === 'function') {
      DI.configureInjectable(target, { primary: true })
      return
    }

    defineBean(target.constructor, propertyKey!, {
      dependencies: getParamTypes(target, propertyKey),
      primary: true
    })
  }
}
