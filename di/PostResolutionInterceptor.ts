import { ResolutionContext } from './ResolutionContext.js'

export interface PostResolutionInterceptor<T = any, A = unknown> {
  intercept(instance: T, ctx: ResolutionContext<A>): T
}
