import { Identifier } from '../internal/types/Identifier.js'
import { Token } from '../Token.js'
import { configureBean } from '../internal/utils/beanUtils.js'
import { DiTypes } from '../internal/DiTypes.js'

export function ScopedAs(scopeId: Identifier) {
  return function (target: Function | object, propertyKey?: string | symbol) {
    if (typeof target === 'function') {
      DiTypes.instance().configure(target as Token, { scopeId })
      return
    }

    configureBean(target.constructor, propertyKey!, {
      scopeId
    })
  }
}
