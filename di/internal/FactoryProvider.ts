import { Provider } from '../Provider.js'
import { ResolutionContext } from '../ResolutionContext.js'

export class FactoryProvider<T> implements Provider<T> {
  constructor(private readonly factory: (ctx: ResolutionContext) => T) {}

  provide(ctx: ResolutionContext): T {
    return this.factory(ctx)
  }
}
