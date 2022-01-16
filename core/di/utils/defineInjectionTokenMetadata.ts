import { Token } from '../Token.js'
import { TokenSpec } from '../Token.js'
import { INJECTION_TOKEN_METADATA_KEY } from './keys.js'

export function defineInjectionTokenMetadata(
  tokenSpec: Token<unknown> | TokenSpec<unknown>
): (target: any, propertyKey: string | symbol, parameterIndex: number) => any {
  return function (target: any, propertyKey: string | symbol, parameterIndex: number): any {
    const descriptors: Record<string, Token<unknown> | TokenSpec<unknown>> =
      Reflect.getOwnMetadata(INJECTION_TOKEN_METADATA_KEY, target) || {}
    descriptors[parameterIndex] = tokenSpec

    Reflect.defineMetadata(INJECTION_TOKEN_METADATA_KEY, descriptors, target)
  }
}
