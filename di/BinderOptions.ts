import { Identifier } from './Identifier.js'

export interface BinderOptions<T> {
  as(scopeId: Identifier): BinderOptions<T>

  qualifiers(...names: Identifier[]): BinderOptions<T>

  lazy(lazy?: boolean): BinderOptions<T>

  primary(primary?: boolean): BinderOptions<T>

  singletonScoped(): BinderOptions<T>

  transientScoped(): BinderOptions<T>

  containerScoped(): BinderOptions<T>

  resolutionContextScoped(): BinderOptions<T>
}
