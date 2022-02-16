import { Conditional } from './Conditional.js'
import { Identifier } from './Identifier.js'
import { id } from './internal/id.js'
import { PostResolutionInterceptor } from './internal/PostResolutionInterceptor.js'
import { Provider } from './internal/Provider.js'
import { TokenSpec } from './Token.js'

export interface Binding<T = any> {
  id: number
  injections: TokenSpec<unknown>[]
  injectableProperties: [Identifier, TokenSpec<unknown>][]
  injectableMethods: [Identifier, TokenSpec<unknown>[]][]
  interceptors: PostResolutionInterceptor[]
  namespace: Identifier
  scopeId: Identifier
  names: Identifier[]
  rawProvider: Provider<T>
  scopedProvider: Provider<T>
  conditionals: Conditional[]
  type?: Function
  configuration?: boolean
  cachedInstance?: T
  primary?: boolean
  late?: boolean
  lazy?: boolean
  preDestroy?: Identifier
  postConstruct?: Identifier
}

export function newBinding<T>(initial: Partial<Binding<T>> = {}): Binding<T> {
  return {
    id: initial.id === undefined ? id() : initial.id,
    injections: initial.injections || [],
    injectableProperties: initial.injectableProperties || [],
    injectableMethods: initial.injectableMethods || [],
    interceptors: initial.interceptors || [],
    namespace: initial.namespace || '',
    names: initial.names || [],
    conditionals: initial.conditionals || [],
    cachedInstance: initial.cachedInstance,
    primary: initial.primary,
    lazy: initial.lazy,
    late: initial.late,
    preDestroy: initial.preDestroy,
    postConstruct: initial.postConstruct,
    configuration: initial.configuration,
    type: initial.type,
    scopeId: initial.scopeId!,
    scopedProvider: initial.scopedProvider!,
    rawProvider: initial.rawProvider!
  }
}
