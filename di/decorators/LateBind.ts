import { TypeRegistrar } from '../internal/TypeRegistrar.js'
import { Ctor } from '../internal/types.js'

export function LateBind<T>(lateBind = true) {
  return function (target: Ctor<T>) {
    TypeRegistrar.configure<T>(target, { late: lateBind })
  }
}
