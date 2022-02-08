import { configureInjectionMetadata } from '../utils/configureInjectionMetadata.js'

export function Optional(): ParameterDecorator {
  return configureInjectionMetadata({ optional: true })
}
