import { Provider } from '../Provider.js'
import { ProviderContext } from '../Provider.js'

export class FactoryProvider<T> implements Provider<T> {
  constructor(private readonly factory: (ctx: ProviderContext) => T) {}

  provide(ctx: ProviderContext): T {
    return this.factory(ctx)
  }
}
