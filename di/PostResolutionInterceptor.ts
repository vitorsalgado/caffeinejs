import { ResolutionContext } from './internal/index.js'

export interface PostResolutionInterceptor<T = any> {
  intercept(instance: T, ctx: ResolutionContext): T
}
