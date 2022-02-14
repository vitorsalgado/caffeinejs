import { Vars } from '../internal/Vars.js'
import { Identifier } from '../Identifier.js'
import { TokenSpec } from '../Token.js'

export function getInjectableMethods<TFunction extends Function>(
  target: TFunction
): Array<[Identifier, TokenSpec<unknown>[]]> {
  const setterMethods: string[] = Reflect.getOwnMetadata(Vars.CLASS_SETTER_METHODS, target) || []

  if (setterMethods.length === 0) {
    return []
  }

  const result = new Array<[Identifier, TokenSpec<unknown>[]]>()

  for (const method of setterMethods) {
    const tokens = Reflect.getOwnMetadata(Vars.CLASS_SETTER_METHODS_TOKENS, target, method)
    result.push([method, tokens])
  }

  return result
}
