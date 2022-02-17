import { DI } from '../DI.js'
import { Provider } from '../Provider.js'

export function ProvidedBy<T>(provider: Provider<T>): ClassDecorator {
  return function (target) {
    DI.configureType<T>(target, { rawProvider: provider })
  }
}
