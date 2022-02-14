import { Conditional } from './Conditional.js'
import { Identifier } from './Identifier.js'
import { ProviderFactory } from './internal/Provider.js'
import { Provider } from './internal/Provider.js'
import { Scope } from './Scope.js'
import { TokenSpec } from './Token.js'

export interface Binding<T = any> {
  dependencies: TokenSpec<unknown>[]
  propertyDependencies: [Identifier, TokenSpec<unknown>][]
  methodInjections: [Identifier, TokenSpec<unknown>[]][]
  postProviderFactories: ProviderFactory[]
  namespace: Identifier
  scopeId: Identifier
  names: Identifier[]
  scope: Scope<T>
  rawProvider: Provider<T>
  scopedProvider: Provider<T>
  conditionals: Conditional[]
  type?: Function
  configuration?: boolean
  instance?: T
  primary?: boolean
  late?: boolean
  lazy?: boolean
  preDestroy?: Identifier
  postConstruct?: Identifier
}

export function newBinding<T>(initial: Partial<Binding<T>> = {}): Binding<T> {
  return {
    dependencies: initial.dependencies || [],
    propertyDependencies: initial.propertyDependencies || [],
    methodInjections: initial.methodInjections || [],
    postProviderFactories: initial.postProviderFactories || [],
    namespace: initial.namespace || '',
    names: initial.names || [],
    conditionals: initial.conditionals || [],
    instance: initial.instance,
    primary: initial.primary,
    lazy: initial.lazy,
    late: initial.late,
    preDestroy: initial.preDestroy,
    postConstruct: initial.postConstruct,
    configuration: initial.configuration,
    type: initial.type,
    scopeId: initial.scopeId!,
    scopedProvider: initial.scopedProvider!,
    rawProvider: initial.rawProvider!,
    scope: initial.scope!
  }
}
