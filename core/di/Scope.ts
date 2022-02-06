import { Provider } from './internal/Provider.js'

export abstract class Scope<T = any> {
  abstract wrap(unscoped: Provider<T>): Provider<T>
}
