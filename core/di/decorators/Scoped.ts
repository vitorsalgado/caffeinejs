import { DI } from '../DI.js'

export function Scoped(scope: string | symbol) {
  return function <TFunction extends Function>(target: TFunction | object, _propertyKey?: string | symbol) {
    DI.configureInjectable(target, { lifecycle: scope })
  }
}
