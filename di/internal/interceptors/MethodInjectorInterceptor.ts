import { Resolver } from '../../Resolver.js'
import { PostResolutionInterceptor } from '../../PostResolutionInterceptor.js'
import { ResolutionContext } from '../../ResolutionContext.js'

export class MethodInjectorInterceptor<T> implements PostResolutionInterceptor<T> {
  intercept(instance: any, ctx: ResolutionContext): T {
    if (instance === null || instance === undefined) {
      return instance
    }

    for (const [method, spec] of ctx.binding.injectableMethods) {
      const deps = spec.map((dep, index) => Resolver.resolveParam(ctx.container, ctx.token, dep, index, ctx.args))

      instance[method](...deps)
    }

    return instance as T
  }
}
