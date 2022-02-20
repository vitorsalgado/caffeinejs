import { Token } from '../Token.js'
import { configureBean } from '../internal/utils/beanUtils.js'
import { TypeRegistrar } from '../internal/TypeRegistrar.js'
import { Identifier } from '../internal/types.js'
import { Lifecycle } from '../Lifecycle.js'

export function Scoped(scopeId: Identifier) {
  return function (target: Function | object, propertyKey?: string | symbol) {
    if (typeof target === 'function') {
      TypeRegistrar.configure(target as Token, { scopeId })
      return
    }

    configureBean(target.constructor, propertyKey!, {
      scopeId,
    })
  }
}

Scoped.SINGLETON = Lifecycle.SINGLETON
Scoped.TRANSIENT = Lifecycle.TRANSIENT
Scoped.CONTAINER = Lifecycle.CONTAINER
Scoped.LOCAL_RESOLUTION = Lifecycle.LOCAL_RESOLUTION
Scoped.REQUEST = Lifecycle.REQUEST
Scoped.REFRESH = Lifecycle.REFRESH
