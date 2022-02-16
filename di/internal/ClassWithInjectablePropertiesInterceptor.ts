import { Resolver } from '../Resolver.js'
import { PostResolutionInterceptor } from './PostResolutionInterceptor.js'
import { ProviderContext } from './Provider.js'

export class ClassWithInjectablePropertiesInterceptor<T> implements PostResolutionInterceptor<T> {
  intercept(instance: any, ctx: ProviderContext): T {
    for (const [prop, token] of ctx.binding.injectableProperties) {
      instance[prop] = Resolver.resolveParam(ctx.di, ctx.token, token, prop, ctx.resolutionContext)
    }

    return instance
  }
}
