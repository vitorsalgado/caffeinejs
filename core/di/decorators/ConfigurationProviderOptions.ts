import { Identifier } from '../Identifier.js'
import { Token } from '../Token.js'
import { TokenSpec } from '../Token.js'

export interface ConfigurationProviderOptions {
  scopeId: Identifier
  lazy: boolean
  token: Token
  dependencies: TokenSpec[]
  name: Identifier
  primary: boolean
  late: boolean
}
