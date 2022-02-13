import { BindToOptions } from './BindToOptions.js'
import { Identifier } from './Identifier.js'

export interface BinderOptions<T> {
  as(scopeId: Identifier): BinderOptions<T>

  qualifiers(...names: Identifier[]): BinderOptions<T>

  lazy(lazy?: boolean): BindToOptions<T>

  singletonScoped(): void

  transientScoped(): void

  containerScoped(): void

  resolutionContextScoped(): void
}
