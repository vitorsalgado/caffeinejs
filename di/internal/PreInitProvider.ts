import { PostProcessor } from '../PostProcessor.js'
import { ProviderContext } from './Provider.js'
import { Provider } from './Provider.js'

export class PreInitProvider<T> implements Provider<T> {
  constructor(private readonly provider: Provider<T>, private readonly postProcessor: PostProcessor) {}

  provide(ctx: ProviderContext): T {
    return this.postProcessor.beforeInit(this.provider.provide(ctx), ctx) as T
  }
}
