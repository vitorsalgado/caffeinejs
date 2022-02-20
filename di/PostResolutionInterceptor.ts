import { ResolutionContext } from './ResolutionContext.js'

export interface PostResolutionInterceptor<T = any> {
  intercept(instance: T, ctx: ResolutionContext): T
}
