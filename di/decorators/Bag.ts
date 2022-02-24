import { configureInjectionMetadata } from '../internal/utils/configureInjectionMetadata.js'
import { TokenBag } from '../Token.js'
import { Token } from '../Token.js'
import { isNamedToken } from '../Token.js'
import { Ctor } from '../internal/types.js'

export function Bag(bag: TokenBag[]): ParameterDecorator {
  return configureInjectionMetadata({
    bag,
  })
}

export interface BagItemType {
  key: string | symbol
  multiple?: boolean
  optional?: boolean
}

export function bagItem(
  token: Token,
  keyOrOptions?: string | symbol | BagItemType,
  options?: Omit<BagItemType, 'key'>,
): TokenBag {
  if (typeof keyOrOptions === 'object') {
    return { token, key: keyOrOptions.key, optional: keyOrOptions.optional, multiple: keyOrOptions.multiple }
  } else {
    return {
      token,
      key: keyOrOptions ? keyOrOptions : isNamedToken(token) ? token : (token as Ctor).name.toLowerCase(),
      multiple: options?.multiple,
      optional: options?.optional,
    }
  }
}

export function bagItems(token: Token, keyOrOptions?: string | symbol): TokenBag {
  return {
    token,
    key: keyOrOptions ? keyOrOptions : isNamedToken(token) ? token : (token as Ctor).name.toLowerCase(),
    multiple: true,
  }
}
