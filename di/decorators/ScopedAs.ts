import { DI } from '../DI.js'
import { Identifier } from '../Identifier.js'
import { Token } from '../Token.js'
import { configureBean } from './utils/beanUtils.js'

export function ScopedAs(scopeId: Identifier) {
  return function (target: Function | object, propertyKey?: string | symbol) {
    if (typeof target === 'function') {
      DI.configureType(target as Token, { scopeId })
      return
    }

    configureBean(target.constructor, propertyKey!, {
      scopeId
    })
  }
}
