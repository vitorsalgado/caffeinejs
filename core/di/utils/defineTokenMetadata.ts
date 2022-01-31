import { TokenSpec } from '../Token.js'
import { INJECTION_TOKEN_METADATA_KEY } from './keys.js'

export function defineTokenMetadata(
  tokenSpec: Partial<TokenSpec<unknown>>
): <TFunction>(target: TFunction, propertyKey: string | symbol, parameterIndex: number) => void {
  return function (target: any, propertyKey: string | symbol, parameterIndex: number): void {
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
