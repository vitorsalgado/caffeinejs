import { notNil } from '../preconditions/notNil.js'
import { Binding } from './Binding.js'
import { Token } from './Token.js'

export interface BindingEntry {
  token: Token
  binding: Binding
}

export class BindingRegistry {
  private readonly _types: Map<Token, Binding> = new Map()

  register<T>(token: Token<T>, binding: Binding<T>): void {
    notNil(token)
    notNil(binding)

    const entry = this.entry(token)

    this._types.set(token, { ...entry, ...binding })
  }

  find<T>(token: Token<T>): Binding<T> | undefined {
    return this._types.get(token) as Binding<T> | undefined
  }

  has(token: Token): boolean {
    return this._types.has(token)
  }

  entries(): IterableIterator<[Token<unknown>, Binding]> {
    return this._types.entries()
  }

  collect(): BindingEntry[] {
    return Array.from(this._types.entries()).map(([token, registration]) => ({ token, binding: registration }))
  }

  remove(token: Token): boolean {
    return this._types.delete(token)
  }

  clear(): void {
    this._types.clear()
  }

  private entry(token: Token<unknown>): Binding {
    const entry = this._types.get(token)

    if (entry) {
      return entry
    }

    this._types.set(token, {} as Binding)

    return this._types.get(token) ?? ({} as Binding)
  }
}
