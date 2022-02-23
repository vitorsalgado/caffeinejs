import { HookListener } from '../HookListener.js'
import { Hooks } from '../Hooks.js'
import { notNil } from './utils/notNil.js'

export class InternalHookListener implements HookListener {
  private readonly hooks = new Map<keyof Hooks, ((args: any) => void)[]>()

  emit<E extends keyof Hooks>(event: E, args?: Hooks[E]): boolean {
    notNil(event)

    const listeners = this.hooks.get(event)

    if (listeners) {
      for (const listener of listeners) {
        listener(args)
      }

      return true
    }

    return false
  }

  on<E extends keyof Hooks>(event: E, listener: (args: Hooks[E]) => void): this {
    notNil(event)
    notNil(listener)

    if (this.hooks.has(event)) {
      const registered = this.hooks.get(event)!

      for (const r of registered) {
        if (r === listener) {
          throw new Error(`Listener already registered for event: '${String(event)}'`)
        }
      }

      this.hooks.get(event)!.push(listener)

      return this
    }

    this.hooks.set(event, [listener])

    return this
  }

  once<E extends keyof Hooks>(event: E, listener: (args: Hooks[E]) => void): this {
    notNil(event)
    notNil(listener)

    const fn = (args: Hooks[E]): void => {
      listener(args)
      this.off(event, fn)
    }

    if (this.hooks.has(event)) {
      const registered = this.hooks.get(event)!

      for (const r of registered) {
        if (r === listener) {
          throw new Error(`Listener already registered for event: '${String(event)}'`)
        }
      }

      this.hooks.get(event)!.push(fn)

      return this
    }

    this.hooks.set(event, [fn])

    return this
  }

  off<E extends keyof Hooks>(event: E, listener: (args: Hooks[E]) => void): this {
    notNil(event)
    notNil(listener)

    if (!this.hooks.has(event)) {
      return this
    }

    const listeners = this.hooks.get(event)!

    for (let i = 0; i < listeners.length; i++) {
      if (listeners[i] === listener) {
        listeners.splice(i, 1)
        break
      }
    }

    return this
  }

  removeAllListeners<E extends keyof Hooks>(event: E): this {
    this.hooks.delete(notNil(event))
    return this
  }
}
