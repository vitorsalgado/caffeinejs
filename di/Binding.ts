import { Conditional } from './Conditional.js'
import { Identifier } from './Identifier.js'
import { Provider } from './internal/Provider.js'
import { ProviderFactory } from './internal/ProviderFactory.js'
import { Scope } from './Scope.js'
import { Scopes } from './Scopes.js'
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
  afterResolution?: Identifier
}

export function newBinding<T>(initial: Partial<Binding<T>> = {}): Binding<T> {
  //TODO: refactor this to undefined and set default on DI configuration
  const lifecycle = initial.scopeId === undefined ? Scopes.SINGLETON : initial.scopeId
  const lazy =
    initial.lazy === undefined ? !(lifecycle === Scopes.SINGLETON || lifecycle === Scopes.CONTAINER) : initial.lazy

  return {
    lazy,
    scopeId: lifecycle,
    dependencies: initial.dependencies || [],
    propertyDependencies: initial.propertyDependencies || [],
    methodInjections: initial.methodInjections || [],
    postProviderFactories: initial.postProviderFactories || [],
    namespace: initial.namespace || '',
    names: initial.names || [],
    conditionals: initial.conditionals || [],
    instance: initial.instance,
    primary: initial.primary,
    late: initial.late,
    preDestroy: initial.preDestroy,
    afterResolution: initial.afterResolution,
    configuration: initial.configuration,
    type: initial.type,
    scopedProvider: initial.scopedProvider!,
    rawProvider: initial.rawProvider!,
    scope: initial.scope!
  }
}
