import { TokenProvider } from '../internal/providers/TokenProvider.js'
import { check } from '../internal/utils/check.js'
import { DiTypes } from '../internal/DiTypes.js'
import { AbstractCtor } from '../internal/types.js'
import { Ctor } from '../internal/types.js'

export function Extends<T>(base: Ctor<T> | AbstractCtor<T>) {
  check(typeof base === 'function', `@Extends parameter must be a class reference (typeof 'function')`)

  return function <TFunction extends Function>(target: TFunction) {
    DiTypes.configure<T>(base, { rawProvider: new TokenProvider(target) })
  }
}
