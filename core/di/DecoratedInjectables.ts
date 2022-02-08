import { notNil } from '../preconditions/notNil.js'
import { newBinding } from './Binding.js'
import { Binding } from './Binding.js'
import { Token } from './Token.js'

export class DecoratedInjectables {
  private static INSTANCE = new DecoratedInjectables()
  private readonly _entries = new Map<Token, Binding>()
  private readonly _beans: Array<[Token, Binding]> = []

  private constructor() {
    // internal
  }

  static instance(): DecoratedInjectables {
    return DecoratedInjectables.INSTANCE
  }

  configure<T>(ctor: Token<T>, info: Partial<Binding>): DecoratedInjectables {
    notNil(ctor)

    const entry = this._entries.get(ctor)

    if (entry) {
      this._entries.set(ctor, { ...entry, ...info })
    } else {
      this._entries.set(ctor, newBinding(info))
    }

    return this
  }

  addBean<T>(token: Token<T>, binding: Binding<T>): DecoratedInjectables {
    notNil(token)
    notNil(binding)

    this._beans.push([token, binding])

    return this
  }

  deleteBean(token: Token): void {
    const idx = this._beans.findIndex(([k, v]) => k === token)

    if (idx > -1) {
      this._beans.splice(idx, 1)
    }
  }

  get<T>(ctor: Token<T>): Binding<T> | undefined {
    return this._entries.get(ctor)
  }

  entries(): IterableIterator<[Token, Binding]> {
    return this._entries.entries()
  }

  beans(): Array<[Token, Binding]> {
    return this._beans
  }

  delete(token: Token): boolean {
    notNil(token)
    return this._entries.delete(token)
  }
}
