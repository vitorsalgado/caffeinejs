import { Binding } from '../Binding.js'
import { Scope } from '../Scope.js'
import { Provider } from '../Provider.js'
import { ResolutionContext } from './ResolutionContext.js'

export class SingletonScope implements Scope {
  get<T>(ctx: ResolutionContext, unscoped: Provider<T>): T {
    if (ctx.binding.cachedInstance) {
      return ctx.binding.cachedInstance
    }

    ctx.binding.cachedInstance = unscoped.provide(ctx)

    return ctx.binding.cachedInstance
  }

  cachedInstance<T>(binding: Binding): T | undefined {
    return binding.cachedInstance
  }

  remove(binding: Binding): void {
    binding.cachedInstance = null
  }
}
