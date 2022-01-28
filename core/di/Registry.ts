import { isNil } from '../checks/isNil.js'
import { Token } from './Token.js'
import { TypeInfo } from './TypeInfo.js'

export interface RegistryEntry {
  token: Token<unknown>
  registration: TypeInfo
}

export class Registry {
  private readonly _data: Map<Token<unknown>, TypeInfo> = new Map()

  register(token: Token<unknown>, binding: TypeInfo): void {
    const entry = this.entry(token)

    binding.primary = isNil(entry.primary) ? binding.primary : entry.primary
    binding.late = isNil(entry.late) ? binding.late : entry.late
    binding.lifecycle = isNil(entry.lifecycle) ? binding.lifecycle : entry.lifecycle
    binding.provider = isNil(entry.provider) ? binding.provider : entry.provider
    binding.dependencies = isNil(entry.dependencies) ? binding.dependencies : entry.dependencies
    binding.instance = isNil(entry.primary) ? binding.primary : entry.primary
    binding.namespace = isNil(entry.namespace) ? binding.namespace : entry.namespace

    this._data.set(token, binding)
  }

  findMany<T>(token: Token<T>): TypeInfo<T> {
    return (this._data.get(token) || []) as TypeInfo<T>
  }

  has(token: Token<unknown>): boolean {
    return this._data.has(token)
  }

  entries(): IterableIterator<[Token<unknown>, TypeInfo]> {
    return this._data.entries()
  }

  collect(): RegistryEntry[] {
    return Array.from(this._data.entries()).map(([token, registration]) => ({ token, registration }))
  }

  clear(): void {
    this._data.clear()
  }

  private entry(token: Token<unknown>): TypeInfo {
    const entry = this._data.get(token)

    if (entry) {
      return entry
    }

    this._data.set(token, {} as TypeInfo)

    return this._data.get(token) ?? ({} as TypeInfo)
  }
}
