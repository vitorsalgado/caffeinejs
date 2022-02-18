import { Binding } from '../Binding.js'
import { Scope } from '../Scope.js'
import { Provider } from '../Provider.js'
import { ResolutionContext } from './ResolutionContext.js'

export class LocalResolutionScope implements Scope {
  get<T>(ctx: ResolutionContext, unscoped: Provider<T>): T {
    if (ctx.localResolutions.resolutions.has(ctx.binding)) {
      return ctx.localResolutions.resolutions.get(ctx.binding)
    }

    const resolved = unscoped.provide(ctx)

    ctx.localResolutions.resolutions.set(ctx.binding, resolved)

    return resolved
  }

  cachedInstance<T>(_binding: Binding): T | undefined {
    return undefined
  }

  remove(_binding: Binding): void {
    // not needed in this scope
  }
}
