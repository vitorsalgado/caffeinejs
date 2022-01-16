import { TokenSpec } from '../Token.js'
import { Token } from '../Token.js'
import { INJECTION_TOKEN_METADATA_KEY } from './keys.js'

export function getParamTypes<TFunction>(target: TFunction): (Token<unknown> | TokenSpec<unknown>)[] {
  const params: unknown[] = Reflect.getMetadata('design:paramtypes', target) || []
  const injectionTokens: Record<string, Token<unknown> | TokenSpec<unknown>> =
    Reflect.getOwnMetadata(INJECTION_TOKEN_METADATA_KEY, target) || {}

  Object.keys(injectionTokens).forEach(key => {
    params[+key] = injectionTokens[key]
  })

  return params as (Token<unknown> | TokenSpec<unknown>)[]
}
