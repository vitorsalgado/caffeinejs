import { DiVars } from '../../DiVars.js'
import { ConfigurationProviderOptions } from '../ConfigurationProviderOptions.js'

export function configureBean(
  target: Function,
  method: string | symbol,
  configurations: Partial<ConfigurationProviderOptions>
): void {
  const factories: Map<string | symbol, ConfigurationProviderOptions> =
    Reflect.getOwnMetadata(DiVars.CONFIGURATION_PROVIDER, target) || new Map()
  const actual = factories.get(method) || def()
  const definition = { ...actual, method, ...configurations } as ConfigurationProviderOptions

  factories.set(method, definition)

  Reflect.defineMetadata(DiVars.CONFIGURATION_PROVIDER, factories, target)
}

export function getBeanConfiguration(target: Function, method: string | symbol): ConfigurationProviderOptions {
  const factories: Map<string | symbol, ConfigurationProviderOptions> =
    Reflect.getOwnMetadata(DiVars.CONFIGURATION_PROVIDER, target) || new Map()
  return factories.get(method) || def()
}

function def(): ConfigurationProviderOptions {
  return {
    dependencies: [],
    conditionals: []
  } as unknown as ConfigurationProviderOptions
}
