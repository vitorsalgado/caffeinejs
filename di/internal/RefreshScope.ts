import { Binding } from '../Binding.js'
import { Provider } from '../Provider.js'
import { DestructionAwareScope } from './DestructionAwareScope.js'
import { ResolutionContext } from './ResolutionContext.js'

export class RefreshScope extends DestructionAwareScope {
  private readonly instances = new Map<number, unknown>()

  get<T>(ctx: ResolutionContext, unscoped: Provider<T>): T {
    if (this.instances.has(ctx.binding.id)) {
      return this.instances.get(ctx.binding.id) as T
    }

    const resolved = unscoped.provide(ctx)

    this.instances.set(ctx.binding.id, resolved)

    return resolved
  }

  cachedInstance<T>(binding: Binding): T | undefined {
    return binding.cachedInstance
  }

  remove(binding: Binding): void {
    binding.cachedInstance = null
  }

  refresh(): Promise<void> {
    return Promise.all(
      this.destructionCallbacks.map(x => {
        const r = x()

        if (r && 'then' in r && typeof r.then === 'function') {
          return r
        }

        return Promise.resolve()
      })
    )
      .then(() => undefined)
      .finally(() => this.instances.clear())
  }
}
