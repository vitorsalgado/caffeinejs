import { Identifier } from './internal/types.js'
import { Token } from './Token.js'
import { Binding } from './Binding.js'
import { BindingEntry } from './internal/BindingRegistry.js'
import { Binder } from './Binder.js'
import { DI } from './DI.js'
import { Lifecycle } from './Lifecycle.js'
import { MetadataReader } from './MetadataReader.js'
import { HookListener } from './HookListener.js'
import { Filter } from './Filter.js'
import { PostProcessor } from './PostProcessor.js'

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
  scopeId: Lifecycle.SINGLETON,
}

export interface Container {
  readonly namespace: Identifier
  readonly parent?: DI
  readonly [Symbol.toStringTag]: string
  readonly size: number
  readonly hooks: HookListener

  configureBinding<T>(token: Token<T>, incoming: Binding<T>): void

  get<T, A = unknown>(token: Token<T>, args?: A): T

  getRequired<T, A = unknown>(token: Token<T>, args?: A): T

  getMany<T, A = unknown>(token: Token<T>, args?: A): T[]

  getAsync<T, A = unknown>(token: Token<T>, args?: A): Promise<T>

  has<T>(token: Token<T>, checkParent?: boolean): boolean

  search(predicate: <T>(token: Token<T>, binding: Binding) => boolean): BindingEntry[]

  bind<T>(token: Token<T>): Binder<T>

  unbind<T>(token: Token<T>): void

  unbindAsync<T>(token: Token<T>): Promise<void>

  rebind<T>(token: Token<T>): Binder<T>

  rebindAsync<T>(token: Token<T>): Promise<Binder<T>>

  newChild(): Container

  getBindings<T>(token: Token<T>): Binding<T>[]

  addPostProcessor(postProcessor: PostProcessor): void

  removePostProcessor(posProcessor: PostProcessor): void

  removeAllPostProcessors(): void

  clear(): void

  resetInstances(): void

  resetInstance(token: Token): void

  resetInstanceAsync(token: Token): Promise<void>

  initInstances(): void

  dispose(): Promise<void>

  addFilters(...filters: Filter[]): void

  setup(): void

  configurationBeans(): IterableIterator<Token>

  types(): IterableIterator<[Token, Binding]>

  entries(): IterableIterator<[Token, Binding]>

  qualifiers(): IterableIterator<[Identifier, Binding[]]>

  toString(): string

  [Symbol.iterator](): IterableIterator<[Token, Binding]>
}
