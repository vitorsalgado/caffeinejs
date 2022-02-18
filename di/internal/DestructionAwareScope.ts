import { Scope } from '../Scope.js'
import { Provider } from '../Provider.js'
import { Binding } from '../Binding.js'
import { ResolutionContext } from './ResolutionContext.js'

export abstract class DestructionAwareScope implements Scope {
  protected readonly destructionCallbacks = new Array<() => Promise<void> | void>()

  abstract cachedInstance<T>(binding: Binding): T | undefined

  abstract get<T>(ctx: ResolutionContext, provider: Provider<T>): T

  abstract remove(binding: Binding): void

  registerDestructionCallback(callback: () => Promise<void> | void): void {
    this.destructionCallbacks.push(callback)
  }
}
