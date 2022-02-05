import { Provider } from './Provider.js'
import { ProviderContext } from './Provider.js'

export class FactoryProvider<T> extends Provider<T> {
  constructor(private readonly factory: (ctx: ProviderContext) => T) {
    super()
  }

  provide(ctx: ProviderContext): T {
    return this.factory(ctx)
  }
}
