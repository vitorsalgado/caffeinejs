import { Binding } from '../Binding.js'
import { DI } from '../DI.js'
import { ResolutionContext } from '../ResolutionContext.js'
import { Token } from '../Token.js'
import { ClassProvider } from './ClassProvider.js'
import { TokenProvider } from './TokenProvider.js'
import { Ctor } from './types/Ctor.js'

export interface ProviderContext {
  di: DI
  token: Token
  binding: Binding
  resolutionContext: ResolutionContext
}

export interface Provider<T = any> {
  provide(ctx: ProviderContext): T
}

export interface ProviderFactory {
  provide(previous: Provider): Provider
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
