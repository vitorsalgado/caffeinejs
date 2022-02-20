import { Token } from '../Token.js'
import { configureInjectionMetadata } from '../internal/utils/configureInjectionMetadata.js'
import { notNil } from '../internal/utils/notNil.js'

export function InjectAll(token: Token) {
  notNil(token, '@InjectAll token parameter is required. Provide the type of the expected components array.')

  return configureInjectionMetadata({ token, multiple: true })
}
