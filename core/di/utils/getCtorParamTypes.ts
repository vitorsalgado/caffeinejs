import { TokenSpec } from '../Token.js'
import { INJECTION_TOKEN_METADATA_KEY } from './keys.js'

export function getCtorParamTypes<TFunction>(target: TFunction): TokenSpec<unknown>[] {
  const paramsTypes: unknown[] = Reflect.getOwnMetadata('design:paramtypes', target) || []
  const params = [...paramsTypes]

  const injectionTokens: Record<string, TokenSpec<unknown>> = Reflect.getOwnMetadata(
    INJECTION_TOKEN_METADATA_KEY,
    target
  ) || {}

  for (let i = 0; i < params.length; i++) {
    const key = +i
    if (injectionTokens[key]) {
      params[key] = injectionTokens[key]
    } else {
      params[key] = { token: params[key] }
    }
  }

  return params as TokenSpec<unknown>[]
}