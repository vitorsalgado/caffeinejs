import { PostResolutionInterceptor } from '../PostResolutionInterceptor.js'
import { Provider } from '../Provider.js'
import { ResolutionContext } from './ResolutionContext.js'

export class EntrypointProvider<T> implements Provider<T> {
  constructor(private readonly rawProvider: Provider<T>, private readonly interceptors: PostResolutionInterceptor[]) {}

  provide(ctx: ResolutionContext): T {
    let result = this.rawProvider.provide(ctx)

    for (const interceptor of this.interceptors) {
      result = interceptor.intercept(result, ctx)
    }

    return result
  }
}
