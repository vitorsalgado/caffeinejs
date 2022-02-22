import { Binding } from '../../Binding.js'
import { SingletonScope } from './SingletonScope.js'

export class RefreshScope extends SingletonScope {
  protected readonly _destructionCallbacks = new Map<number, () => Promise<void> | void>()

  refresh(): Promise<void> {
    return Promise.all(Array.from(this._destructionCallbacks.values()).map(preDestroy => Promise.resolve(preDestroy())))
      .then(() => undefined)
      .finally(() => this._cachedInstances.clear())
  }

  configure(binding: Binding) {
    this._destructionCallbacks.set(binding.id, () => this.cachedInstance<any>(binding)?.[binding.preDestroy!]())
  }

  undo(binding: Binding) {
    this._destructionCallbacks.delete(binding.id)
  }
}
