import { Scope } from '../Scope.js'
import { ProviderContext } from './Provider.js'
import { Provider } from './Provider.js'

export class TransientScope<T> implements Scope<T> {
  wrap(unscoped: Provider): Provider {
    return new (class extends Provider {
      provide(ctx: ProviderContext): T {
        return unscoped.provide(ctx)
      }
    })()
  }
}
