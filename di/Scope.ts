import { Provider } from './internal/Provider.js'

export interface Scope<T = any> {
  wrap(unscoped: Provider<T>): Provider<T>
}
