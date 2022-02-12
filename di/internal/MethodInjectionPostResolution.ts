import { Resolver } from '../Resolver.js'
import { PostResolution } from './PostResolution.js'
import { Provider } from './Provider.js'
import { ProviderContext } from './Provider.js'

export class MethodInjectionPostResolution<T> extends PostResolution<T> {
  constructor(private readonly provider: Provider<T>) {
    super()
  }

  provide(ctx: ProviderContext): T {
    const instance: any = this.provider.provide(ctx)

    if (instance === null || instance === undefined) {
      return instance
    }

    for (const [method, spec] of ctx.binding.methodInjections) {
      const deps = spec.map((dep, index) => Resolver.resolveParam(ctx.di, ctx.token, dep, index, ctx.resolutionContext))

      instance[method](...deps)
    }

    return instance as T
  }
}
