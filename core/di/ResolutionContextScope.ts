import { ProviderContext } from './internal/Provider.js'
import { Provider } from './internal/Provider.js'
import { Scope } from './Scope.js'

class ResolutionContextScopeProvider<T> extends Provider<T> {
  constructor(private readonly unscoped: Provider<T>) {
    super()
  }

  provide(ctx: ProviderContext): T {
    if (ctx.resolutionContext.resolutions.has(ctx.binding)) {
      return ctx.resolutionContext.resolutions.get(ctx.binding) as T
    }

    const resolved = this.unscoped.provide(ctx)

    ctx.resolutionContext.resolutions.set(ctx.binding, resolved)

    return resolved
  }
}

export class ResolutionContextScope<T> extends Scope<T> {
  wrap(unscoped: Provider): Provider {
    return new ResolutionContextScopeProvider(unscoped)
  }
}
