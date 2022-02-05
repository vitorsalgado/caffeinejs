import { Provider } from './internal/Provider.js'
import { Scope } from './Scope.js'
import { SingletonScopeProvider } from './SingletonScope.js'

export class ContainerScope<T> extends Scope<T> {
  wrap(unscoped: Provider): Provider {
    return new SingletonScopeProvider(unscoped)
  }
}
