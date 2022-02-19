import { DiTypes } from '../internal/DiTypes.js'
import { Identifier } from '../internal/types.js'

export function Namespace<T>(namespace: Identifier) {
  return function <TFunction extends Function>(target: TFunction) {
    DiTypes.instance().configure<T>(target, { namespace })
  }
}
