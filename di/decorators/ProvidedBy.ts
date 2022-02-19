import { Provider } from '../Provider.js'
import { DiTypes } from '../internal/DiTypes.js'

export function ProvidedBy<T>(provider: Provider<T>): ClassDecorator {
  return function (target) {
    DiTypes.configure<T>(target, { rawProvider: provider })
  }
}
