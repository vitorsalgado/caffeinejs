import { Token } from '../Token.js'
import { configureInjectionMetadata } from '../utils/configureInjectionMetadata.js'
import { notNil } from '../utils/notNil.js'

export function InjectAll(
  token: Token
): <TFunction>(target: TFunction, propertyKey: string | symbol, parameterIndex: number) => void {
  notNil(token, '@InjectAll token parameter is required. Provide the type of the expected components array.')

  return configureInjectionMetadata({ token, multiple: true })
}
