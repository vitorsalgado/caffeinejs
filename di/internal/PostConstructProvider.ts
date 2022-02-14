import { ProviderContext } from './Provider.js'
import { Provider } from './Provider.js'

export class PostConstructProvider<T> implements Provider<T> {
  constructor(private readonly provider: Provider<T>) {}

  provide(ctx: ProviderContext): T {
    const instance: any = this.provider.provide(ctx)

    if (instance === null || instance === undefined) {
      return instance
    }

    instance[ctx.binding.postConstruct!]()

    return instance
  }
}
