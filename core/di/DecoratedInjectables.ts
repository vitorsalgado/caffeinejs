import { notNil } from '../preconditions/notNil.js'
import { newBinding } from './Binding.js'
import { Binding } from './Binding.js'
import { Token } from './Token.js'

export class DecoratedInjectables {
  private static INSTANCE = new DecoratedInjectables()
  private readonly _entries = new Map<Token, Binding>()

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
      const i = newBinding(info)
      this._entries.set(ctor, i)
    }

    return this
  }

  get<T>(ctor: Token<T>): Binding<T> | undefined {
    return this._entries.get(ctor)
  }

  entries(): IterableIterator<[Token, Binding]> {
    return this._entries.entries()
  }

  delete(token: Token): boolean {
    notNil(token)
    return this._entries.delete(token)
  }
}
