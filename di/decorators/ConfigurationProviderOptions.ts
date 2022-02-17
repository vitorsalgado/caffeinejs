import { Identifier } from '../internal/types/Identifier.js'
import { Token } from '../Token.js'
import { TokenSpec } from '../Token.js'
import { Conditional } from './ConditionalOn.js'

export interface ConfigurationProviderOptions {
  scopeId: Identifier
  lazy: boolean
  token: Token
  dependencies: TokenSpec[]
  conditionals: Conditional[]
  name: Identifier
  primary: boolean
  late: boolean
}
