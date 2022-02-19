import { Token } from '../Token.js'
import { configureBean } from '../internal/utils/beanUtils.js'
import { DiTypes } from '../internal/DiTypes.js'
import { Identifier } from '../internal/types.js'

export function Scoped(scopeId: Identifier) {
  return function (target: Function | object, propertyKey?: string | symbol) {
    if (typeof target === 'function') {
      DiTypes.configure(target as Token, { scopeId })
      return
    }

    configureBean(target.constructor, propertyKey!, {
      scopeId
    })
  }
}
