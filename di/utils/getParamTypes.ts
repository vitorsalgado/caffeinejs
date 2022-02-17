import { Vars } from '../internal/Vars.js'
import { TokenSpec } from '../Token.js'

export function getParamTypes(target: any, propertyKey?: string | symbol): TokenSpec<unknown>[] {
  const paramTypes: unknown[] =
    (propertyKey !== undefined
      ? Reflect.getOwnMetadata('design:paramtypes', target, propertyKey)
      : Reflect.getOwnMetadata('design:paramtypes', target)) || []
  const params = [...paramTypes]

  const injectionTokens: Record<number, TokenSpec<unknown>> = (propertyKey === undefined
    ? Reflect.getOwnMetadata(Vars.CLASS_CTOR_INJECTION_TOKENS, target)
    : Reflect.getOwnMetadata(Vars.CLASS_CTOR_INJECTION_TOKENS, target.constructor, propertyKey)) || {}

  for (let i = 0; i < params.length; i++) {
    const key = +i
    if (injectionTokens[key]) {
      const token = injectionTokens[key].token ? injectionTokens[key].token : params[key]
      params[key] = { ...injectionTokens[key], token, tokenType: params[key] }
    } else {
      params[key] = { token: params[key], tokenType: params[key] }
    }
  }

  return params as TokenSpec<unknown>[]
}
