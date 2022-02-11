import { DiVars } from '../DiVars.js'
import { TokenSpec } from '../Token.js'

export function configureInjectionMetadata(
  tokenSpec: Partial<TokenSpec<unknown>>
): <TFunction>(target: TFunction, propertyKey: string | symbol, parameterIndex?: number | PropertyDescriptor) => void {
  return function (target: any, propertyKey: string | symbol, parameterIndex?: number | PropertyDescriptor): void {
    if (parameterIndex !== undefined && typeof parameterIndex === 'number') {
      const descriptors: Record<string, TokenSpec<unknown>> = Reflect.getOwnMetadata(
        DiVars.CTOR_INJECTION_TOKENS,
        target
      ) || {}

      if (descriptors[parameterIndex]) {
        descriptors[parameterIndex] = { ...descriptors[parameterIndex], ...tokenSpec }
      } else {
        descriptors[parameterIndex] = tokenSpec as TokenSpec<unknown>
      }

      Reflect.defineMetadata(DiVars.CTOR_INJECTION_TOKENS, descriptors, target)

      return
    }

    const tokenType = Reflect.getMetadata('design:type', target, propertyKey)
    const token = tokenSpec.token ? tokenSpec.token : tokenType
    const descriptors: Record<string | symbol, TokenSpec<unknown>> = Reflect.getOwnMetadata(
      DiVars.PROPERTY_INJECTION_TOKENS,
      target.constructor
    ) || {}

    descriptors[propertyKey] = { ...descriptors[propertyKey], ...tokenSpec, token, tokenType }

    Reflect.defineMetadata(DiVars.PROPERTY_INJECTION_TOKENS, descriptors, target.constructor)

    return
  }
}
