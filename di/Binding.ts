import { Identifier } from './internal/types/Identifier.js'
import { newId } from './internal/utils/newId.js'
import { PostResolutionInterceptor } from './PostResolutionInterceptor.js'
import { Provider } from './Provider.js'
import { TokenSpec } from './Token.js'
import { Conditional } from './decorators/ConditionalOn.js'

export interface Binding<T = any> {
  id: number
  injections: TokenSpec<unknown>[]
  injectableProperties: [Identifier, TokenSpec<unknown>][]
  injectableMethods: [Identifier, TokenSpec<unknown>[]][]
  lookupProperties: [Identifier, TokenSpec<unknown>][]
  interceptors: PostResolutionInterceptor[]
  namespace: Identifier
  scopeId: Identifier
  names: Identifier[]
  rawProvider: Provider<T>
  scopedProvider: Provider<T>
  conditionals: Conditional[]
  configuredBy?: string
  type?: Function
  configuration?: boolean
  primary?: boolean
  late?: boolean
  lazy?: boolean
  preDestroy?: Identifier
  postConstruct?: Identifier
}

export function newBinding<T>(initial: Partial<Binding<T>> = {}): Binding<T> {
  return {
    id: initial.id === undefined ? newId() : initial.id,
    injections: initial.injections || [],
    injectableProperties: initial.injectableProperties || [],
    injectableMethods: initial.injectableMethods || [],
    lookupProperties: initial.lookupProperties || [],
    interceptors: initial.interceptors || [],
    namespace: initial.namespace || '',
    names: initial.names || [],
    conditionals: initial.conditionals || [],
    configuredBy: initial.configuredBy,
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
