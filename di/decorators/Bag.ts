import { configureInjectionMetadata } from '../internal/utils/configureInjectionMetadata.js'
import { TokenBag } from '../Token.js'
import { Token } from '../Token.js'
import { check } from '../internal/utils/check.js'

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
  keyOrOptions: string | symbol | BagItemType,
  options?: Omit<BagItemType, 'key'>,
): TokenBag {
  if (typeof keyOrOptions === 'object') {
    check(!!keyOrOptions.key, 'Key argument is required when using decorator @Bag()')

    return { token, key: keyOrOptions.key, optional: keyOrOptions.optional, multiple: keyOrOptions.multiple }
  } else {
    check(!!keyOrOptions, 'Key argument is required when using decorator @Bag()')

    return {
      token,
      key: keyOrOptions,
      multiple: options?.multiple,
      optional: options?.optional,
    }
  }
}

export function bagItems(token: Token, key: string | symbol): TokenBag {
  check(!!key, 'Key argument is required when using decorator @Bag()')

  return {
    token,
    key,
    multiple: true,
  }
}
