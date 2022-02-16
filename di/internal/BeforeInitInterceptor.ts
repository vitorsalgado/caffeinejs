import { PostProcessor } from '../PostProcessor.js'
import { PostResolutionInterceptor } from './PostResolutionInterceptor.js'
import { ProviderContext } from './Provider.js'

export class BeforeInitInterceptor<T> implements PostResolutionInterceptor<T> {
  constructor(private readonly postProcessor: PostProcessor) {}

  intercept(instance: any, ctx: ProviderContext): T {
    return this.postProcessor.beforeInit(instance, ctx) as T
  }
}
