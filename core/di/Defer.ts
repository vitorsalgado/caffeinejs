import { DeferredCtor } from './DeferredCtor.js'
import { Token } from './Token.js'
import { defineTokenMetadata } from './utils/defineTokenMetadata.js'

export function Defer(tokenFn: () => Token<unknown>): ParameterDecorator {
  return defineTokenMetadata({ token: new DeferredCtor(tokenFn) })
}
