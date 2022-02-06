import { DiVars } from '../DiVars.js'
import { TokenSpec } from '../Token.js'

export function getParamTypes<TFunction>(target: TFunction, propertyKey?: string | symbol): TokenSpec<unknown>[] {
  const paramsTypes: unknown[] =
    (propertyKey
      ? Reflect.getOwnMetadata('design:paramtypes', target, propertyKey)
      : Reflect.getOwnMetadata('design:paramtypes', target)) || []
  const params = [...paramsTypes]

  const injectionTokens: Record<string, TokenSpec<unknown>> = Reflect.getOwnMetadata(DiVars.INJECTION_KEY, target) || {}

  for (let i = 0; i < params.length; i++) {
    const key = +i
    if (injectionTokens[key]) {
      params[key] = { ...injectionTokens[key], tokenType: params[key] }
    } else {
      params[key] = { token: params[key], tokenType: params[key] }
    }
  }

  return params as TokenSpec<unknown>[]
}
