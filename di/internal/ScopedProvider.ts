import { Scope } from '../Scope.js'
import { Provider } from '../Provider.js'
import { ResolutionContext } from './ResolutionContext.js'

export class ScopedProvider<T> implements Provider<T> {
  constructor(private readonly scope: Scope, private readonly creator: Provider<T>) {}

  provide(ctx: ResolutionContext): T {
    return this.scope.get(ctx, this.creator)
  }
}
