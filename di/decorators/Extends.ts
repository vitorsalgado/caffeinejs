import { DI } from '../DI.js'
import { TokenProvider } from '../internal/TokenProvider.js'
import { AbstractCtor } from '../internal/types/AbstractCtor.js'
import { Ctor } from '../internal/types/Ctor.js'
import { check } from '../utils/check.js'

export function Extends<T>(base: Ctor<T> | AbstractCtor<T>) {
  check(typeof base === 'function', `@Extends parameter must be a class reference (typeof 'function')`)

  return function <TFunction extends Function>(target: TFunction) {
    DI.configureType<T>(base, { rawProvider: new TokenProvider(target) })
  }
}
