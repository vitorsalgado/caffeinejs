import { SingletonScope } from './SingletonScope.js'

export class RefreshScope extends SingletonScope {
  protected readonly _destructionCallbacks = new Array<() => Promise<void> | void>()

  refresh(): Promise<void> {
    return Promise.all(
      this._destructionCallbacks.map(x => {
        const r = x()

        if (r && 'then' in r && typeof r.then === 'function') {
          return r
        }

        return Promise.resolve()
      }),
    )
      .then(() => undefined)
      .finally(() => this._cachedInstances.clear())
  }

  registerDestructionCallback(callback: () => Promise<void> | void): void {
    this._destructionCallbacks.push(callback)
  }
}
