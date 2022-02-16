import { Resolver } from '../Resolver.js'
import { PostResolutionInterceptor } from './PostResolutionInterceptor.js'
import { ProviderContext } from './Provider.js'

export class MethodInjectorInterceptor<T> implements PostResolutionInterceptor<T> {
  intercept(instance: any, ctx: ProviderContext): T {
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
