import { Scope } from '../Scope.js'
import { ProviderContext } from '../Provider.js'
import { Provider } from '../Provider.js'
import { Binding } from '../Binding.js'

export abstract class DestructionAwareScope implements Scope {
  protected readonly destructionCallbacks = new Array<() => Promise<void> | void>()

  abstract cachedInstance<T>(binding: Binding): T | undefined

  abstract get<T>(ctx: ProviderContext, provider: Provider<T>): T

  abstract remove(binding: Binding): void

  registerDestructionCallback(callback: () => Promise<void> | void): void {
    this.destructionCallbacks.push(callback)
  }
}
