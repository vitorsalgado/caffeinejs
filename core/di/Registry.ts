import { Binding } from './Binding.js'
import { Token } from './Token.js'

export interface RegistryEntry {
  token: Token<unknown>
  registrations: Binding<unknown>[]
}

export class Registry {
  private readonly _data: Map<Token<unknown>, Binding<unknown>[]> = new Map()

  register(token: Token<unknown>, binding: Binding<unknown>): void {
    this.entry(token).push(binding)
  }

  findSingle<T>(token: Token<T>): Binding<T> | undefined {
    const entries = this._data.get(token) || []

    if (entries.length > 1) {
      const primary = entries.find(x => x.primary)

      if (primary) {
        return primary as Binding<T>
      }

      throw new Error('More than one registration.')
    }

    return entries[0] as Binding<T>
  }

  findMany<T>(token: Token<T>): Binding<T>[] {
    return (this._data.get(token) || []) as Binding<T>[]
  }

  has(token: Token<unknown>): boolean {
    return this._data.has(token)
  }

  entries(): IterableIterator<[Token<unknown>, Binding<unknown>[]]> {
    return this._data.entries()
  }

  collect(): RegistryEntry[] {
    return Array.from(this._data.entries()).map(([token, registrations]) => ({ token, registrations }))
  }

  private entry(token: Token<unknown>): Binding<unknown>[] {
    const entry = this._data.get(token)

    if (entry) {
      return entry
    }

    this._data.set(token, [])

    return this._data.get(token) ?? []
  }
}
