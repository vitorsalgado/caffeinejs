import { DI } from '../DI.js'
import { Identifier } from '../Identifier.js'

export function Namespace<T>(namespace: Identifier) {
  return function <TFunction extends Function>(target: TFunction) {
    DI.configureType<T>(target, { namespace })
  }
}
