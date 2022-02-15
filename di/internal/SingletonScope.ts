import { Scope } from '../Scope.js'
import { Token } from '../Token.js'
import { ProviderContext } from './Provider.js'
import { Provider } from './Provider.js'

export class SingletonScopeProvider<T> implements Provider<T> {
  constructor(private readonly unscoped: Provider<T>) {}

  provide(ctx: ProviderContext): T {
    if (ctx.binding.instance) {
      return ctx.binding.instance
    }

    const resolved = this.unscoped.provide(ctx)
    ctx.binding.instance = resolved

    return resolved
  }
}

export class SingletonScope<T> implements Scope<T> {
  scope(token: Token, unscoped: Provider): Provider {
    return new SingletonScopeProvider(unscoped)
  }
}
