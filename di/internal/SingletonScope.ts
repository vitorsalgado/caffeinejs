import { Binding } from '../Binding.js'
import { Scope } from '../Scope.js'
import { Provider } from '../Provider.js'
import { ResolutionContext } from './ResolutionContext.js'

export class SingletonScope implements Scope {
  get<T>(ctx: ResolutionContext, unscoped: Provider<T>): T {
    if (ctx.binding.cachedInstance) {
      return ctx.binding.cachedInstance
    }

    const resolved = unscoped.provide(ctx)

    ctx.binding.cachedInstance = resolved

    return resolved
  }

  cachedInstance<T>(binding: Binding): T | undefined {
    return binding.cachedInstance
  }

  remove(binding: Binding): void {
    binding.cachedInstance = null
  }
}
