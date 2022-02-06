import { BuiltInLifecycles } from './BuiltInLifecycles.js'
import { Identifier } from './Identifier.js'
import { Provider } from './internal/Provider.js'
import { SingletonScope } from './internal/SingletonScope.js'
import { Scope } from './Scope.js'
import { TokenSpec } from './Token.js'

export interface Binding<T = any> {
  dependencies: TokenSpec<unknown>[]
  namespace: Identifier
  lifecycle: Identifier
  names: Identifier[]
  scope: Scope<T>
  instance?: T
  provider?: Provider<unknown>
  scopedProvider?: Provider<unknown>
  primary?: boolean
  late?: boolean
  lazy?: boolean
  onDestroy?: Identifier
}

export function newBinding<T>(initial: Partial<Binding<T>> = {}): Binding<T> {
  const lifecycle = initial.lifecycle === undefined ? BuiltInLifecycles.SINGLETON : initial.lifecycle
  const lazy =
    initial.lazy === undefined
      ? !(lifecycle === BuiltInLifecycles.SINGLETON || lifecycle === BuiltInLifecycles.CONTAINER)
      : initial.lazy

  return {
    lazy,
    lifecycle,
    dependencies: initial.dependencies || [],
    namespace: initial.namespace || '',
    names: initial.names || [],
    instance: initial.instance,
    provider: initial.provider,
    primary: initial.primary,
    late: initial.late,
    onDestroy: initial.onDestroy,
    scopedProvider: initial.scopedProvider,
    scope: initial.scope || new SingletonScope()
  }
}
