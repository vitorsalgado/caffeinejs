import { DeferredCtor } from './DeferredCtor.js'
import { Token } from './Token.js'
import { defineInjectionTokenMetadata } from './utils/defineInjectionTokenMetadata.js'

export function Defer(tokenFn: () => Token<unknown>): ParameterDecorator {
  return defineInjectionTokenMetadata(new DeferredCtor(tokenFn))
}
