import { ProviderContext } from './internal/Provider.js'
import { Provider } from './internal/Provider.js'
import { Scope } from './Scope.js'

export class SingletonScopeProvider<T> extends Provider<T> {
  constructor(private readonly unscoped: Provider<T>) {
    super()
  }

  provide(ctx: ProviderContext): T {
    if (ctx.binding.instance) {
      return ctx.binding.instance
    }

    const resolved = this.unscoped.provide(ctx)
    ctx.binding.instance = resolved

    return resolved
  }
}

export class SingletonScope<T> extends Scope<T> {
  wrap(unscoped: Provider): Provider {
    return new SingletonScopeProvider(unscoped)
  }
}
