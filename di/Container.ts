import { Identifier } from './internal/types.js'
import { Token } from './Token.js'
import { Binding } from './Binding.js'
import { BindingEntry } from './internal/BindingRegistry.js'
import { Binder } from './Binder.js'
import { DI } from './DI.js'
import { Lifecycle } from './Lifecycle.js'
import { MetadataReader } from './MetadataReader.js'

export interface ContainerOptions {
  namespace: Identifier
  scopeId: Identifier
  lazy?: boolean
  lateBind?: boolean
  overriding?: boolean
  metadataReader?: MetadataReader
}

export const InitialOptions: ContainerOptions = {
  namespace: '',
  scopeId: Lifecycle.SINGLETON
}

export interface ContainerLifecycle {
  onBinding(token: Token, binding: Binding): void

  onBound(token: Token, binding: Binding): void

  onNotBound(token: Token, binding: Binding): void
}

export interface Container {
  readonly namespace: Identifier
  readonly parent?: DI

  readonly [Symbol.toStringTag]: string
  readonly size: number

  configureBinding<T>(token: Token<T>, incoming: Binding<T>): void

  get<T>(token: Token<T>, args?: unknown): T

  getRequired<T>(token: Token<T>, args?: unknown): T

  getMany<T>(token: Token<T>, args?: unknown): T[]

  has<T>(token: Token<T>, checkParent?: boolean): boolean

  search(predicate: <T>(token: Token<T>, registration: Binding) => boolean): BindingEntry[]

  bind<T>(token: Token<T>): Binder<T>

  unbind<T>(token: Token<T>): void

  unbindAsync<T>(token: Token<T>): Promise<void>

  rebind<T>(token: Token<T>): Binder<T>

  rebindAsync<T>(token: Token<T>): Promise<Binder<T>>

  newChild(): Container

  getBindings<T>(token: Token<T>): Binding<T>[]

  clear(): void

  resetInstances(): void

  resetInstance(token: Token): void

  resetInstanceAsync(token: Token): Promise<void>

  bootstrap(): void

  dispose(): Promise<void>

  setup(): void

  entries(): Iterable<[Token, Binding]>

  qualifiers(): Iterable<[Identifier, Binding[]]>

  toString(): string

  [Symbol.iterator](): IterableIterator<[Token, Binding]>
}
