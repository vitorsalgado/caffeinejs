import { DeferredCtor } from '../DeferredCtor.js'
import { Token } from '../Token.js'
import { check } from '../utils/check.js'
import { configureInjectionMetadata } from '../utils/configureInjectionMetadata.js'

export function Defer(tokenFn: () => Token<unknown>): ParameterDecorator {
  check(typeof tokenFn === 'function', '@Defer parameter must be a function returning the desired type.')
  return configureInjectionMetadata({ token: new DeferredCtor(tokenFn) })
}
