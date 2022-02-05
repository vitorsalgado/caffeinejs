import { Token } from '../Token.js'
import { TokenSpec } from '../Token.js'

export interface ConfigurationProviderOptions {
  token: Token
  dependencies: TokenSpec[]
  name: string | symbol
}
