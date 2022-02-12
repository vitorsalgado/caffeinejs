import { DiVars } from '../DiVars.js'
import { TokenSpec } from '../Token.js'

export function getParamTypes(target: any, propertyKey?: string | symbol): TokenSpec<unknown>[] {
  const paramTypes: unknown[] =
    (propertyKey !== undefined
      ? Reflect.getOwnMetadata('design:paramtypes', target, propertyKey)
      : Reflect.getOwnMetadata('design:paramtypes', target)) || []
  const params = [...paramTypes]

  const injectionTokens: Record<number, TokenSpec<unknown>> = (propertyKey === undefined
    ? Reflect.getOwnMetadata(DiVars.CLASS_CTOR_INJECTION_TOKENS, target)
    : Reflect.getOwnMetadata(DiVars.CLASS_CTOR_INJECTION_TOKENS, target.constructor, propertyKey)) || {}

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
