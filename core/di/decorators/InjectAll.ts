import { Token } from '../Token.js'
import { configureInjectionMetadata } from '../utils/configureInjectionMetadata.js'

export function InjectAll(
  token: Token
): <TFunction>(target: TFunction, propertyKey: string | symbol, parameterIndex: number) => void {
  return configureInjectionMetadata({ token, multiple: true })
}
