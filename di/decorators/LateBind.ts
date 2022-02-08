import { Ctor } from '../internal/types/Ctor.js'
import { DI } from '../DI.js'

export function LateBind<T>() {
  return function (target: Ctor<T>) {
    DI.configureDecoratedType<T>(target, { late: true })
  }
}
