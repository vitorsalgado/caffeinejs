import { Token } from '../Token.js'
import { configureInjectionMetadata } from '../utils/configureInjectionMetadata.js'

export function Inject(token: Token<unknown>): ParameterDecorator {
  return configureInjectionMetadata({ token })
}
