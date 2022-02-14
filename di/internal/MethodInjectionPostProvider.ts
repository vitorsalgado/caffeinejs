import { Resolver } from '../Resolver.js'
import { Provider } from './Provider.js'
import { ProviderContext } from './Provider.js'

export class MethodInjectionPostProvider<T> implements Provider<T> {
  constructor(private readonly provider: Provider<T>) {}

  provide(ctx: ProviderContext): T {
    const instance: any = this.provider.provide(ctx)

    if (instance === null || instance === undefined) {
      return instance
    }

    for (const [method, spec] of ctx.binding.injectableMethods) {
      const deps = spec.map((dep, index) => Resolver.resolveParam(ctx.di, ctx.token, dep, index, ctx.resolutionContext))

      instance[method](...deps)
    }

    return instance as T
  }
}
