import { Token } from './Token.js'
import { defineInjectionTokenMetadata } from './utils/defineInjectionTokenMetadata.js'

export function InjectAll(
  token: Token<any>
): (target: any, propertyKey: string | symbol, parameterIndex: number) => any {
  return defineInjectionTokenMetadata({ token, multiple: true })
}
