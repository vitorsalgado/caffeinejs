import { ProviderContext } from './Provider.js'
import { Provider } from './Provider.js'

export class AfterResolutionPostProvider<T> extends Provider<T> {
  constructor(private readonly provider: Provider<T>) {
    super()
  }

  provide(ctx: ProviderContext): T {
    const instance: any = this.provider.provide(ctx)

    if (instance === null || instance === undefined || ctx.binding.afterResolution === undefined) {
      return instance
    }

    instance[ctx.binding.afterResolution]()

    return instance
  }
}
