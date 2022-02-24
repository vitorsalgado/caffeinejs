import { Token } from '../Token.js'
import { TokenSpec } from '../Token.js'
import { Identifier } from '../internal/types.js'
import { PostResolutionInterceptor } from '../PostResolutionInterceptor.js'
import { Conditional } from './ConditionalOn.js'

export interface ConfigurationProviderOptions {
  scopeId: Identifier
  token: Token
  dependencies: TokenSpec[]
  conditionals: Conditional[]
  names: Identifier[]
  type: Function
  primary: boolean
  late: boolean
  lazy: boolean
  options: object
  byPassPostProcessors: boolean
  interceptors: PostResolutionInterceptor[]
}
