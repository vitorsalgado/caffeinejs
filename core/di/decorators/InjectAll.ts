import { Token } from '../Token.js'
import { defineTokenMetadata } from '../utils/defineTokenMetadata.js'

export function InjectAll(
  token: Token
): <TFunction>(target: TFunction, propertyKey: string | symbol, parameterIndex: number) => void {
  return defineTokenMetadata({ token, multiple: true })
}
