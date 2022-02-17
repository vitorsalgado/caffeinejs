import { Binding } from '../Binding.js'
import { Scope } from '../Scope.js'
import { ProviderContext } from '../Provider.js'
import { Provider } from '../Provider.js'

export class ResolutionContextScope implements Scope {
  get<T>(ctx: ProviderContext, unscoped: Provider<T>): T {
    if (ctx.resolutionContext.resolutions.has(ctx.binding)) {
      return ctx.resolutionContext.resolutions.get(ctx.binding)
    }

    const resolved = unscoped.provide(ctx)

    ctx.resolutionContext.resolutions.set(ctx.binding, resolved)

    return resolved
  }

  cachedInstance<T>(_binding: Binding): T | undefined {
    return undefined
  }

  remove(_binding: Binding): void {
    // not needed in this scope
  }
}
