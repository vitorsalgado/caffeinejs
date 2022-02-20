import { ResolutionContext } from '../../ResolutionContext.js'
import { PostResolutionInterceptor } from '../../PostResolutionInterceptor.js'

export class FunctionPostResolutionInterceptor<T = any> implements PostResolutionInterceptor {
  constructor(private readonly fn: (instance: T, ctx: ResolutionContext) => T) {}

  intercept(instance: T, ctx: ResolutionContext): T {
    return this.fn(instance, ctx)
  }
}
