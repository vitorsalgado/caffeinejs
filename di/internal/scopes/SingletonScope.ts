import { Binding } from '../../Binding.js'
import { Scope } from '../../Scope.js'
import { Provider } from '../../Provider.js'
import { ResolutionContext } from '../../ResolutionContext.js'

export class SingletonScope implements Scope {
  protected readonly _cachedInstances = new Map<number, unknown | undefined>()

  get<T>(ctx: ResolutionContext, unscoped: Provider<T>): T {
    const id = ctx.binding.id
    const cached = this._cachedInstances.get(id)

    if (cached) {
      return cached as T
    }

    const resolved = unscoped.provide(ctx)
    this._cachedInstances.set(id, resolved)

    return resolved
  }

  cachedInstance<T>(binding: Binding): T | undefined {
    return this._cachedInstances.get(binding.id) as T | undefined
  }

  remove(binding: Binding): void {
    this._cachedInstances.set(binding.id, undefined)
  }
}
