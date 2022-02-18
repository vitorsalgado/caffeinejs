import { Vars } from '../Vars.js'
import { ConfigurationProviderOptions } from '../../decorators/ConfigurationProviderOptions.js'

export function configureBean(
  target: Function,
  method: string | symbol,
  configurations: Partial<ConfigurationProviderOptions>
): void {
  const factories: Map<string | symbol, ConfigurationProviderOptions> =
    Reflect.getOwnMetadata(Vars.CONFIGURATION_PROVIDER, target) || new Map()
  const actual = factories.get(method) || def()
  const definition = { ...actual, method, ...configurations } as ConfigurationProviderOptions

  factories.set(method, definition)

  Reflect.defineMetadata(Vars.CONFIGURATION_PROVIDER, factories, target)
}

export function getBeanConfiguration(target: Function, method: string | symbol): ConfigurationProviderOptions {
  const factories: Map<string | symbol, ConfigurationProviderOptions> =
    Reflect.getOwnMetadata(Vars.CONFIGURATION_PROVIDER, target) || new Map()
  return factories.get(method) || def()
}

function def(): ConfigurationProviderOptions {
  return {
    dependencies: [],
    conditionals: []
  } as unknown as ConfigurationProviderOptions
}
