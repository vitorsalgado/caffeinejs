import { DiVars } from '../../DiVars.js'
import { ConfigurationProviderOptions } from '../ConfigurationProviderOptions.js'

export function configureBean(
  target: Function,
  method: string | symbol,
  configurations: Partial<ConfigurationProviderOptions>
): void {
  const factories: Map<string | symbol, ConfigurationProviderOptions> =
    Reflect.getOwnMetadata(DiVars.CONFIGURATION_PROVIDER, target) || new Map()
  const actual = factories.get(method) || ({} as ConfigurationProviderOptions)
  const definition = { ...actual, method, ...configurations }

  factories.set(method, definition)

  Reflect.defineMetadata(DiVars.CONFIGURATION_PROVIDER, factories, target)
}

export function getBeanConfiguration(target: Function, method: string | symbol): ConfigurationProviderOptions {
  const factories: Map<string | symbol, ConfigurationProviderOptions> =
    Reflect.getOwnMetadata(DiVars.CONFIGURATION_PROVIDER, target) || new Map()
  return factories.get(method) || ({} as ConfigurationProviderOptions)
}
