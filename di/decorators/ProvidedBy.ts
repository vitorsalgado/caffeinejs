import { DI } from '../DI.js'
import { Provider } from '../internal/Provider.js'

export function ProvidedBy<T>(provider: Provider<T>): ClassDecorator {
  return function (target) {
    DI.configureDecoratedType<T>(target, { rawProvider: provider })
  }
}
