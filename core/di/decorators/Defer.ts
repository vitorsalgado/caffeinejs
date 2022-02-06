import { DeferredCtor } from '../DeferredCtor.js'
import { Token } from '../Token.js'
import { configureInjectionMetadata } from '../utils/configureInjectionMetadata.js'

export function Defer(tokenFn: () => Token<unknown>): ParameterDecorator {
  return configureInjectionMetadata({ token: new DeferredCtor(tokenFn) })
}
