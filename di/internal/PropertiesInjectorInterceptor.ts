import { Resolver } from '../Resolver.js'
import { PostResolutionInterceptor } from '../PostResolutionInterceptor.js'
import { ResolutionContext } from './ResolutionContext.js'

export class PropertiesInjectorInterceptor<T> implements PostResolutionInterceptor<T> {
  intercept(instance: any, ctx: ResolutionContext): T {
    for (const [prop, token] of ctx.binding.injectableProperties) {
      instance[prop] = Resolver.resolveParam(ctx.di, ctx.token, token, prop, ctx.resolutionContext)
    }

    return instance
  }
}
