import { Scope } from '../Scope.js'
import { Token } from '../Token.js'
import { Provider } from './Provider.js'
import { SingletonScopeProvider } from './SingletonScope.js'

export class ContainerScope<T> implements Scope<T> {
  scope(token: Token, unscoped: Provider): Provider {
    return new SingletonScopeProvider(unscoped)
  }
}
