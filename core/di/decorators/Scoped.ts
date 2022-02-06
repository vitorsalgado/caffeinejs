import { DI } from '../DI.js'
import { Identifier } from '../Identifier.js'
import { Token } from '../Token.js'

export function Scoped(scope: Identifier) {
  return function <TFunction extends Function>(target: TFunction | object, _propertyKey?: string | symbol) {
    DI.configureInjectable(target as Token, { lifecycle: scope })
  }
}
