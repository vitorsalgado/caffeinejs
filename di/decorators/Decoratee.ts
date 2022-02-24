import { configureInjectionMetadata } from '../internal/utils/configureInjectionMetadata.js'

export function Decoratee() {
  return configureInjectionMetadata({ decorated: true })
}
