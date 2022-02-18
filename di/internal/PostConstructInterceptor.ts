import { PostResolutionInterceptor } from '../PostResolutionInterceptor.js'
import { ResolutionContext } from './ResolutionContext.js'

export class PostConstructInterceptor<T> implements PostResolutionInterceptor<T> {
  intercept(instance: any, ctx: ResolutionContext): T {
    if (instance === null || instance === undefined) {
      return instance
    }

    instance[ctx.binding.postConstruct!]()

    return instance
  }
}
