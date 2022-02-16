import { Scope } from '../Scope.js'
import { ProviderContext } from './Provider.js'
import { Provider } from './Provider.js'

export class ScopedProvider<T> implements Provider<T> {
  constructor(private readonly scope: Scope, private readonly creator: Provider<T>) {}

  provide(ctx: ProviderContext): T {
    return this.scope.get(ctx, this.creator)
  }
}
