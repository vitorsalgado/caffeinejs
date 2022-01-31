import { TokenSpec } from '../Token.js'
import { Token } from '../Token.js'

export interface ConfigurationProviderOptions {
  token: Token
  dependencies: TokenSpec[]
  method: string | symbol
}
