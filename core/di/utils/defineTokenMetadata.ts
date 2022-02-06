import { DiVars } from '../DiVars.js'
import { TokenSpec } from '../Token.js'

export function defineTokenMetadata(
  tokenSpec: Partial<TokenSpec<unknown>>
): <TFunction>(target: TFunction, propertyKey: string | symbol, parameterIndex: number) => void {
  return function (target: any, propertyKey: string | symbol, parameterIndex: number): void {
    const descriptors: Record<string, TokenSpec<unknown>> = Reflect.getOwnMetadata(DiVars.INJECTION_KEY, target) || {}

    if (descriptors[parameterIndex]) {
      descriptors[parameterIndex] = { ...descriptors[parameterIndex], ...tokenSpec }
    } else {
      descriptors[parameterIndex] = tokenSpec as TokenSpec<unknown>
    }

    Reflect.defineMetadata(DiVars.INJECTION_KEY, descriptors, target)
  }
}
