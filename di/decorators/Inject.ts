import { Token } from '../Token.js'
import { configureInjectionMetadata } from '../internal/utils/configureInjectionMetadata.js'

export function Inject(token?: Token<unknown>) {
  return configureInjectionMetadata({ token })
}
