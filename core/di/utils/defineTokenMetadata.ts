import { TokenSpec } from '../Token.js'
import { INJECTION_TOKEN_METADATA_KEY } from './keys.js'

export function defineTokenMetadata(
  tokenSpec: Partial<TokenSpec<unknown>>
): (target: any, propertyKey: string | symbol, parameterIndex: number) => any {
  return function (target: any, propertyKey: string | symbol, parameterIndex: number): any {
    const descriptors: Record<string, TokenSpec<unknown>> = Reflect.getOwnMetadata(
      INJECTION_TOKEN_METADATA_KEY,
      target
    ) || {}

    if (descriptors[parameterIndex]) {
      descriptors[parameterIndex] = { ...descriptors[parameterIndex], ...tokenSpec }
    } else {
      descriptors[parameterIndex] = tokenSpec as TokenSpec<unknown>
    }

    Reflect.defineMetadata(INJECTION_TOKEN_METADATA_KEY, descriptors, target)
  }
}
