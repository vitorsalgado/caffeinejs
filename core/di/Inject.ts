import { Token } from './Token.js'
import { defineInjectionTokenMetadata } from './utils/defineInjectionTokenMetadata.js'

export function Inject(token: Token<unknown>): ParameterDecorator {
  return defineInjectionTokenMetadata(token)
}
