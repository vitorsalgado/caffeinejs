import { Binding } from '../Binding.js'
import { tokenStr } from '../Token.js'
import { Provider } from '../Provider.js'
import { Scope } from '../Scope.js'
import { IllegalScopeStateError } from './DiError.js'
import { OutOfScopeError } from './DiError.js'
import { ResolutionContext } from './ResolutionContext.js'

export class RequestScope implements Scope {
  protected readonly destructionCallbacks = new Array<() => Promise<void> | void>()
  private readonly instances = new Map<number, unknown>()
  private entered = false

  begin() {
    if (this.entered) {
      throw new IllegalScopeStateError(
        'Request scoping block already in progress. ' + 'Make sure to start one request scope block per time.'
      )
    }

    this.entered = true
  }

  finish(): Promise<unknown> {
    if (!this.entered) {
      throw new IllegalScopeStateError('No request scoping block is in progress.')
    }

    this.entered = false

    if (this.destructionCallbacks.length === 0) {
      this.instances.clear()
      return Promise.resolve()
    }

    return Promise.all(
      this.destructionCallbacks.map(x => {
        const r = x()

        if (r && 'then' in r && typeof r.then === 'function') {
          return r
        }

        return Promise.resolve()
      })
    ).finally(() => this.instances.clear())
  }

  cachedInstance<T>(binding: Binding): T | undefined {
    return this.instances.get(binding.id) as T | undefined
  }

  get<T>(ctx: ResolutionContext, provider: Provider<T>): T {
    if (!this.entered) {
      throw new OutOfScopeError(`Cannot access the key '${tokenStr(ctx.token)}' outside of a request scoping block.`)
    }

    if (this.instances.has(ctx.binding.id)) {
      return this.instances.get(ctx.binding.id) as T
    }

    const resolved = provider.provide(ctx)

    this.instances.set(ctx.binding.id, resolved)

    return resolved
  }

  remove(binding: Binding): void {
    this.instances.get(binding.id)
  }

  registerDestructionCallback(callback: () => Promise<void> | void): void {
    this.destructionCallbacks.push(callback)
  }
}
