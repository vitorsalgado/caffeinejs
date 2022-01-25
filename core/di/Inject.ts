import { Token } from './Token.js'
import { defineTokenMetadata } from './utils/defineTokenMetadata.js'

export function Inject(token: Token<unknown>): ParameterDecorator {
  return defineTokenMetadata({ token })
}
