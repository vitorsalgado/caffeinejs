import { Binding } from '../Binding.js'
import { Scope } from '../Scope.js'
import { Provider } from '../Provider.js'
import { ResolutionContext } from '../ResolutionContext.js'

export class TransientScope implements Scope {
  get<T>(ctx: ResolutionContext, provider: Provider<T>): T {
    return provider.provide(ctx)
  }

  cachedInstance<T>(_binding: Binding): T | undefined {
    return undefined
  }

  remove(_binding: Binding): void {
    //
  }
}
