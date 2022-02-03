import { Lifecycle } from './Lifecycle.js'
import { Provider } from './Provider.js'
import { TokenSpec } from './Token.js'

export interface Binding<T = any> {
  dependencies: TokenSpec<unknown>[]
  namespace: string | symbol
  lifecycle: Lifecycle
  qualifiers: (string | symbol)[]
  instance?: T
  provider?: Provider<T>
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
    onDestroy: initial.onDestroy
  }
}
