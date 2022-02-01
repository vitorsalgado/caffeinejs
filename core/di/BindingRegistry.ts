import { isNil } from '../checks/isNil.js'
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

    binding.primary = isNil(entry.primary) ? binding.primary : entry.primary
    binding.late = isNil(entry.late) ? binding.late : entry.late
    binding.lifecycle = isNil(entry.lifecycle) ? binding.lifecycle : entry.lifecycle
    binding.provider = isNil(entry.provider) ? binding.provider : entry.provider
    binding.dependencies = isNil(entry.dependencies) ? binding.dependencies : entry.dependencies
    binding.instance = isNil(entry.instance) ? binding.instance : entry.instance
    binding.namespace = isNil(entry.namespace) ? binding.namespace : entry.namespace
    binding.qualifiers = isNil(entry.qualifiers) ? binding.qualifiers : entry.qualifiers
    binding.lazy = isNil(entry.lazy) ? binding.lazy : entry.lazy

    this._types.set(token, binding)
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
