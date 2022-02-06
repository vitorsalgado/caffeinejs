import { Ctor } from '../../types/Ctor.js'
import { DI } from '../DI.js'

export function LateBind<T>() {
  return function (target: Ctor<T>) {
    DI.configureInjectable<T>(target, { late: true })
  }
}
