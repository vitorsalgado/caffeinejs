import { Provider } from './internal/Provider.js'

export abstract class Scope<T> {
  abstract wrap(unscoped: Provider<T>): Provider<T>
}
