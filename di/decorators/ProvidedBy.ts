import { Provider } from '../Provider.js'
import { TypeRegistrar } from '../internal/TypeRegistrar.js'

export function ProvidedBy<T>(provider: Provider<T>): ClassDecorator {
  return function (target) {
    TypeRegistrar.configure<T>(target, { rawProvider: provider })
  }
}
