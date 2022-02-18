import { Binding } from './Binding.js'
import { DI } from './DI.js'
import { ContextResolutions } from './ContextResolutions.js'
import { Token } from './Token.js'
import { ClassProvider } from './internal/ClassProvider.js'
import { TokenProvider } from './internal/TokenProvider.js'
import { Ctor } from './internal/types/Ctor.js'

export interface ProviderContext {
  di: DI
  token: Token
  binding: Binding
  resolutionContext: ContextResolutions
}

export interface Provider<T = any> {
  provide(ctx: ProviderContext): T
}

export function providerFromToken<T>(token: Token<T>, provider?: Provider<T>): Provider<T> {
  if (typeof provider === 'undefined') {
    if (typeof token === 'function') {
      return new ClassProvider<T>(token as Ctor)
    } else {
      return new TokenProvider(token)
    }
  } else {
    return provider
  }
}
