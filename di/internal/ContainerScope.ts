import { Scope } from '../Scope.js'
import { Provider } from './Provider.js'
import { SingletonScopeProvider } from './SingletonScope.js'

export class ContainerScope<T> extends Scope<T> {
  wrap(unscoped: Provider): Provider {
    return new SingletonScopeProvider(unscoped)
  }
}
