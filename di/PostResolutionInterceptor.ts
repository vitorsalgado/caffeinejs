import { ResolutionContext } from './ResolutionContext.js'

export interface PostResolutionInterceptor<T = any> {
  intercept(instance: T, ctx: ResolutionContext): T
}

export class FunctionPostResolutionInterceptor<T = any> implements PostResolutionInterceptor {
  constructor(private readonly fn: (instance: T, ctx: ResolutionContext) => T) {}

  intercept(instance: T, ctx: ResolutionContext): T {
    return this.fn(instance, ctx)
  }
}
