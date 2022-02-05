import { DiVars } from '../../DiVars.js'
import { ConfigurationProviderOptions } from '../ConfigurationProviderOptions.js'

export function defineBean(
  target: Function,
  method: string | symbol,
  configurations: Partial<ConfigurationProviderOptions>
): void {
  const factories: Map<string | symbol, ConfigurationProviderOptions> =
    Reflect.getOwnMetadata(DiVars.BEAN_METHOD, target) || new Map()
  const actual = factories.get(method) || ({} as ConfigurationProviderOptions)
  const definition = { ...actual, method, ...configurations }

  factories.set(method, definition)

  Reflect.defineMetadata(DiVars.BEAN_METHOD, factories, target)
}
