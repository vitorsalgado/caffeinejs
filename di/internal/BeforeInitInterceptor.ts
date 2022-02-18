import { PostProcessor } from '../PostProcessor.js'
import { PostResolutionInterceptor } from '../PostResolutionInterceptor.js'
import { ResolutionContext } from './ResolutionContext.js'

export class BeforeInitInterceptor<T> implements PostResolutionInterceptor<T> {
  constructor(private readonly postProcessor: PostProcessor) {}

  intercept(instance: any, ctx: ResolutionContext): T {
    return this.postProcessor.beforeInit(instance, ctx) as T
  }
}
