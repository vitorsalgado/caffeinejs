import { Identifier } from '../internal/types/Identifier.js'
import { Token } from '../Token.js'
import { TokenSpec } from '../Token.js'
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
}
