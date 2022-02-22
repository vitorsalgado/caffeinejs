import { Binding } from './Binding.js'
import { Provider } from './Provider.js'
import { ResolutionContext } from './ResolutionContext.js'

export interface Scope {
  get<T>(ctx: ResolutionContext, provider: Provider<T>): T

  cachedInstance<T>(binding: Binding): T | undefined

  remove(binding: Binding): void

  configure?(binding: Binding): void

  undo?(binding: Binding): void
}
