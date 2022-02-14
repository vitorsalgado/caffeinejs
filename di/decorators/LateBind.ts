import { Ctor } from '../internal/types/Ctor.js'
import { DI } from '../DI.js'

export function LateBind<T>(lateBind = true) {
  return function (target: Ctor<T>) {
    DI.configureType<T>(target, { late: lateBind })
  }
}
