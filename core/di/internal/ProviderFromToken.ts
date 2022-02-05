import { Ctor } from '../../types/Ctor.js'
import { isNamedToken } from '../Token.js'
import { Token } from '../Token.js'
import { ClassProvider } from './ClassProvider.js'
import { Provider } from './Provider.js'
import { TokenProvider } from './TokenProvider.js'

export function providerFromToken<T>(token: Token<T>, provider?: Provider<T>): Provider<unknown> | undefined {
  if (typeof provider === 'undefined') {
    if (typeof token === 'function') {
      return new ClassProvider<T>(token as Ctor)
    } else if (isNamedToken(token)) {
      return new TokenProvider(token)
    }

    return undefined
  } else {
    return provider
  }
}
