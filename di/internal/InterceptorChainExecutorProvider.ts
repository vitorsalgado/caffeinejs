import { PostResolutionInterceptor } from './PostResolutionInterceptor.js'
import { ProviderContext } from './Provider.js'
import { Provider } from './Provider.js'

export class InterceptorChainExecutorProvider<T> implements Provider<T> {
  constructor(private readonly rawProvider: Provider<T>, private readonly interceptors: PostResolutionInterceptor[]) {}

  provide(ctx: ProviderContext): T {
    let result = this.rawProvider.provide(ctx)

    for (const interceptor of this.interceptors) {
      result = interceptor.intercept(result, ctx)
    }

    return result
  }
}
