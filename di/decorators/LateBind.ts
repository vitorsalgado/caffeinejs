import { Ctor } from '../internal/types/Ctor.js'
import { DiTypes } from '../internal/DiTypes.js'

export function LateBind<T>(lateBind = true) {
  return function (target: Ctor<T>) {
    DiTypes.instance().configure<T>(target, { late: lateBind })
  }
}
