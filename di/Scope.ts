import { Binding } from './Binding.js'
import { ProviderContext } from './internal/Provider.js'
import { Provider } from './internal/Provider.js'

export interface Scope {
  get<T>(ctx: ProviderContext, provider: Provider<T>): T

  cachedInstance<T>(binding: Binding): T | undefined

  remove(binding: Binding): void
}
