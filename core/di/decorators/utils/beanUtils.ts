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
  const conditionals = [...actual.conditionals, ...(configurations.conditionals || [])]
  const names = [...actual.names, ...(configurations.names || [])]
  const definition = { ...actual, method, ...configurations, names, conditionals } as ConfigurationProviderOptions

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
    names: [],
    conditionals: []
  } as unknown as ConfigurationProviderOptions
}
