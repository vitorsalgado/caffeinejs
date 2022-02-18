import { Vars } from '../Vars.js'
import { TokenSpec } from '../../Token.js'

export function getLookupProperties<TFunction>(target: TFunction): [string | symbol, TokenSpec<unknown>][] {
  const injectionTokens: Record<string, TokenSpec<unknown>> = Reflect.getOwnMetadata(
    Vars.CLASS_LOOKUP_PROPERTIES,
    target
  ) || {}

  return Object.entries(injectionTokens)
}
