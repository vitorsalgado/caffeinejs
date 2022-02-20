import { Provider } from '../Provider.js'
import { TypeRegistrar } from '../internal/TypeRegistrar.js'
import { FactoryProvider } from '../internal/providers/FactoryProvider.js'
import { ResolutionContext } from '../ResolutionContext.js'

export function ProvidedBy<T>(provider: Provider<T> | ((ctx: ResolutionContext) => T)): ClassDecorator {
  return function (target) {
    TypeRegistrar.configure<T>(target, {
      rawProvider: typeof provider === 'function' ? new FactoryProvider(provider) : provider,
    })
  }
}
