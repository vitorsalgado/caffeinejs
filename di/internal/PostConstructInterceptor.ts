import { PostResolutionInterceptor } from './PostResolutionInterceptor.js'
import { ProviderContext } from './Provider.js'

export class PostConstructInterceptor<T> implements PostResolutionInterceptor<T> {
  intercept(instance: any, ctx: ProviderContext): T {
    if (instance === null || instance === undefined) {
      return instance
    }

    instance[ctx.binding.postConstruct!]()

    return instance
  }
}
