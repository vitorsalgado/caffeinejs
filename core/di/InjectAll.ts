import { Token } from './Token.js'
import { defineTokenMetadata } from './utils/defineTokenMetadata.js'

export function InjectAll(
  token: Token<any>
): (target: any, propertyKey: string | symbol, parameterIndex: number) => any {
  return defineTokenMetadata({ token, multiple: true })
}
