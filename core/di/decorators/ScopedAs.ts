import { DI } from '../DI.js'
import { Identifier } from '../Identifier.js'
import { Token } from '../Token.js'
import { getParamTypes } from '../utils/getParamTypes.js'
import { configureBean } from './utils/beanUtils.js'

export function ScopedAs(scopeId: Identifier) {
  return function (target: Function | object, propertyKey?: string | symbol) {
    if (typeof target === 'function') {
      DI.configureInjectable(target as Token, { scopeId })
      return
    }

    configureBean(target.constructor, propertyKey!, {
      dependencies: getParamTypes(target, propertyKey),
      scopeId
    })
  }
}
