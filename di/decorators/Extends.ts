import { DI } from '../DI.js'
import { TokenProvider } from '../internal/TokenProvider.js'
import { AbstractCtor } from '../internal/types/AbstractCtor.js'
import { Ctor } from '../internal/types/Ctor.js'

export function Extends<T>(base: Ctor<T> | AbstractCtor<T>) {
  return function <TFunction extends Function>(target: TFunction) {
    DI.configureDecoratedType<T>(base, { rawProvider: new TokenProvider(target) })
    return
  }
}
