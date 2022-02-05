import { Provider } from './internal/Provider.js'
import { Lifecycle } from './Lifecycle.js'
import { Scope } from './Scope.js'
import { SingletonScope } from './internal/SingletonScope.js'
import { TokenSpec } from './Token.js'

export interface Binding<T = any> {
  dependencies: TokenSpec<unknown>[]
  namespace: string | symbol
  lifecycle: string | symbol
  qualifiers: (string | symbol)[]
  scope: Scope<T>
  instance?: T
  provider?: Provider<unknown>
  scopedProvider?: Provider<unknown>
  primary?: boolean
  late?: boolean
  lazy?: boolean
  onDestroy?: string | symbol
}

export function newBinding<T>(initial: Partial<Binding<T>> = {}): Binding<T> {
  const lifecycle = initial.lifecycle === undefined ? Lifecycle.SINGLETON : initial.lifecycle
  const lazy =
    initial.lazy === undefined
      ? !(lifecycle === Lifecycle.SINGLETON || lifecycle === Lifecycle.CONTAINER)
      : initial.lazy

  return {
    dependencies: initial.dependencies || [],
    namespace: initial.namespace || '',
    lifecycle,
    qualifiers: initial.qualifiers || [],
    instance: initial.instance,
    provider: initial.provider,
    primary: initial.primary,
    late: initial.late,
    lazy,
    onDestroy: initial.onDestroy,

    scopedProvider: initial.scopedProvider,
    scope: initial.scope || new SingletonScope()
  }
}
