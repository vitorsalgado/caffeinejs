import { Resolver } from '../Resolver.js'
import { ProviderContext } from './Provider.js'
import { Provider } from './Provider.js'

export class PropertyInjectionPostProvider<T> implements Provider<T> {
  constructor(private readonly provider: Provider<T>) {}

  provide(ctx: ProviderContext): T {
    const instance: any = this.provider.provide(ctx)

    for (const [prop, token] of ctx.binding.injectableProperties) {
      instance[prop] = Resolver.resolveParam(ctx.di, ctx.token, token, prop, ctx.resolutionContext)
    }

    return instance
  }
}
