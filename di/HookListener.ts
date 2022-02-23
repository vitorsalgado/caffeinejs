import { Hooks } from './Hooks.js'

export interface HookListener {
  emit<E extends keyof Hooks>(event: E, args?: Hooks[E]): boolean

  on<E extends keyof Hooks>(event: E, listener: (args: Hooks[E]) => void): this

  once<E extends keyof Hooks>(event: E, listener: (args: Hooks[E]) => void): this

  off<E extends keyof Hooks>(event: E, listener: (args: Hooks[E]) => void): this

  removeAllListeners<E extends keyof Hooks>(event: E): this
}
