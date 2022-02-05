import { ProviderContext } from './internal/Provider.js'
import { Provider } from './internal/Provider.js'
import { Scope } from './Scope.js'

export class TransientScope<T> extends Scope<T> {
  wrap(unscoped: Provider): Provider {
    return new (class extends Provider {
      provide(ctx: ProviderContext): T {
        return unscoped.provide(ctx)
      }
    })()
  }
}
