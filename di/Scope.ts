import { Binding } from './Binding.js'
import { ProviderContext } from './Provider.js'
import { Provider } from './Provider.js'

export interface Scope {
  get<T>(ctx: ProviderContext, provider: Provider<T>): T

  cachedInstance<T>(binding: Binding): T | undefined

  remove(binding: Binding): void

  registerDestructionCallback?(callback: () => Promise<void> | void): void
}
