import { Vars } from '../Vars.js'
import { tokenStr } from '../../Token.js'
import { ConfigurationProviderOptions } from '../../decorators/ConfigurationProviderOptions.js'
import { RepeatedInjectableConfigurationError } from '../DiError.js'

const Def: Partial<ConfigurationProviderOptions> = {
  dependencies: [],
  conditionals: [],
  names: []
}

export function configureBean(
  target: Function,
  method: string | symbol,
  configurations: Partial<ConfigurationProviderOptions>
): void {
  const factories: Map<string | symbol, Partial<ConfigurationProviderOptions>> = Reflect.getOwnMetadata(
    Vars.CONFIGURATION_PROVIDER,
    target
  ) || new Map()
  const actual = factories.get(method) || Def
  const newNames = configurations.names || []
  const existingNames = actual.names || []

  if (existingNames.some(value => newNames.includes(value))) {
    throw new RepeatedInjectableConfigurationError(
      `Found repeated qualifiers for bean '${actual.token ? tokenStr(actual.token) : ''}' on method '${String(
        method
      )}' at configuration class '${target.name}'. Qualifiers found: ${newNames.map(x => tokenStr(x)).join(', ')}`
    )
  }

  factories.set(method, {
    ...actual,
    ...configurations,
    names: [...existingNames, ...newNames]
  })

  Reflect.defineMetadata(Vars.CONFIGURATION_PROVIDER, factories, target)
}

export function getBeanConfiguration(target: Function, method: string | symbol): Partial<ConfigurationProviderOptions> {
  const factories: Map<string | symbol, ConfigurationProviderOptions> =
    Reflect.getOwnMetadata(Vars.CONFIGURATION_PROVIDER, target) || new Map()
  return factories.get(method) || Def
}
