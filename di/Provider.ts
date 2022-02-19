import { Token } from './Token.js'
import { ClassProvider } from './internal/providers/ClassProvider.js'
import { TokenProvider } from './internal/providers/TokenProvider.js'
import { ResolutionContext } from './ResolutionContext.js'
import { Ctor } from './internal/types.js'

export interface Provider<T = any> {
  provide(ctx: ResolutionContext): T
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
