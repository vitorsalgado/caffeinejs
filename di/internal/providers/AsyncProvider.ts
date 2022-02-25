import { Provider } from '../../Provider.js'
import { ResolutionContext } from '../../ResolutionContext.js'

export abstract class AsyncProvider<T, A = unknown> implements Provider<Promise<T>> {
  abstract provide(ctx: ResolutionContext<A>): Promise<T>
}
