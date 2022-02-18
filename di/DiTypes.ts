import { notNil } from './internal/utils/notNil.js'
import { newBinding } from './Binding.js'
import { Binding } from './Binding.js'
import { Token } from './Token.js'

export class DiTypes {
  private static INSTANCE = new DiTypes()
  private readonly _entries = new Map<Token, Binding>()
  private readonly _beans: Array<[Token, Binding]> = []

  private constructor() {
    // internal
  }

  static instance(): DiTypes {
    return DiTypes.INSTANCE
  }

  configure<T>(ctor: Token<T>, info: Partial<Binding>): DiTypes {
    notNil(ctor)

    const entry = this._entries.get(ctor)

    if (entry) {
      this._entries.set(ctor, { ...entry, ...info })
    } else {
      this._entries.set(ctor, newBinding(info))
    }

    return this
  }

  addBean<T>(token: Token<T>, binding: Binding<T>): DiTypes {
    notNil(token)
    notNil(binding)

    this._beans.push([token, binding])

    return this
  }

  deleteBean(token: Token): void {
    const idx = this._beans.findIndex(([k]) => k === token)

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
