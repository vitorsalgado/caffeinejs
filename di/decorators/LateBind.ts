import { DiTypes } from '../internal/DiTypes.js'
import { Ctor } from '../internal/types.js'

export function LateBind<T>(lateBind = true) {
  return function (target: Ctor<T>) {
    DiTypes.instance().configure<T>(target, { late: lateBind })
  }
}
