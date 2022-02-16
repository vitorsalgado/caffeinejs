import { PostProcessor } from '../PostProcessor.js'
import { PostResolutionInterceptor } from './PostResolutionInterceptor.js'
import { ProviderContext } from './Provider.js'

export class AfterInitInterceptor<T> implements PostResolutionInterceptor<T> {
  constructor(private readonly postProcessor: PostProcessor) {}

  intercept(instance: any, ctx: ProviderContext): T {
    return this.postProcessor.afterInit(instance, ctx) as T
  }
}
