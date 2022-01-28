import { DI } from './DI.js'
import { Lifecycle } from './Lifecycle.js'

export function Scope(scope: Lifecycle) {
  return function <TFunction extends Function>(target: TFunction | object, _propertyKey?: string | symbol) {
    DI.configureInjectable(target, { lifecycle: scope })
  }
}
