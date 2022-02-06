import { Ctor } from '../../types/Ctor.js'
import { Token } from '../Token.js'
import { ClassProvider } from './ClassProvider.js'
import { Provider } from './Provider.js'
import { TokenProvider } from './TokenProvider.js'

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
