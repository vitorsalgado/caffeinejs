import { Provider } from './Provider.js'

export abstract class ProviderFactory {
  abstract provide(previous: Provider): Provider
}
