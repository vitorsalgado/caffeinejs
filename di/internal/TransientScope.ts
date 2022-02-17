import { Binding } from '../Binding.js'
import { Scope } from '../Scope.js'
import { ProviderContext } from '../Provider.js'
import { Provider } from '../Provider.js'

export class TransientScope implements Scope {
  get<T>(ctx: ProviderContext, provider: Provider<T>): T {
    return provider.provide(ctx)
  }

  cachedInstance<T>(_binding: Binding): T | undefined {
    return undefined
  }

  remove(_binding: Binding): void {
    //
  }
}
