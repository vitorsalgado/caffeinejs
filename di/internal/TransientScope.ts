import { Scope } from '../Scope.js'
import { Token } from '../Token.js'
import { ProviderContext } from './Provider.js'
import { Provider } from './Provider.js'

export class TransientScope<T> implements Scope<T> {
  scope(token: Token, unscoped: Provider): Provider {
    return new (class implements Provider {
      provide(ctx: ProviderContext): T {
        return unscoped.provide(ctx)
      }
    })()
  }
}
