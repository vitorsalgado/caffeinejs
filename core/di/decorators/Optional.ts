import { defineTokenMetadata } from '../utils/defineTokenMetadata.js'

export function Optional(): ParameterDecorator {
  return defineTokenMetadata({ optional: true })
}
