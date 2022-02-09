import { Scope } from '../Scope.js'
import { ProviderContext } from './Provider.js'
import { Provider } from './Provider.js'

class ResolutionContextScopeProvider<T> extends Provider<T> {
  constructor(private readonly unscoped: Provider<T>) {
    super()
  }

  provide(ctx: ProviderContext): T {
    if (ctx.resolutionContext.resolutions.has(ctx.binding)) {
      return ctx.resolutionContext.resolutions.get(ctx.binding)
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