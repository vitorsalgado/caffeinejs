import { DeferredCtor } from '../internal/DeferredCtor.js'
import { Token } from '../Token.js'
import { check } from '../internal/utils/check.js'
import { configureInjectionMetadata } from '../internal/utils/configureInjectionMetadata.js'

export function Defer(tokenFn: () => Token<unknown>) {
  check(typeof tokenFn === 'function', '@Defer parameter must be a function returning the desired type.')
  return configureInjectionMetadata({ token: new DeferredCtor(tokenFn) })
}
