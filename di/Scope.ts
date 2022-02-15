import { Provider } from './internal/Provider.js'
import { Token } from './Token.js'

export interface Scope<T = any> {
  scope(token: Token, unscoped: Provider<T>): Provider<T>
}
