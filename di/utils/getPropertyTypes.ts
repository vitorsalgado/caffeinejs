import { DiVars } from '../DiVars.js'
import { TokenSpec } from '../Token.js'

export function getPropertyTypes<TFunction>(target: TFunction): [string, TokenSpec<unknown>][] {
  const injectionTokens: Record<string, TokenSpec<unknown>> = Reflect.getOwnMetadata(
    DiVars.CLASS_PROPERTIES_INJECTION_TOKENS,
    target
  ) || {}

  return Object.entries(injectionTokens)
}
