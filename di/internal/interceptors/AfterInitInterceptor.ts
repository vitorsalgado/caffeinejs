import { PostProcessor } from '../../PostProcessor.js'
import { PostResolutionInterceptor } from '../../PostResolutionInterceptor.js'
import { ResolutionContext } from '../../ResolutionContext.js'

export class AfterInitInterceptor<T> implements PostResolutionInterceptor<T> {
  constructor(private readonly postProcessor: PostProcessor) {}

  intercept(instance: T, ctx: ResolutionContext): T {
    return this.postProcessor.afterInit(instance, ctx) as T
  }
}
