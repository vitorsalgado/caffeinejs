import { Scope } from '../Scope.js'
import { ProviderContext } from './Provider.js'
import { Provider } from './Provider.js'

export class TransientScope<T> extends Scope<T> {
  wrap(unscoped: Provider): Provider {
    return new (class extends Provider {
      provide(ctx: ProviderContext): T {
        return unscoped.provide(ctx)
      }
    })()
  }
}
