import { ProviderContext } from './Provider.js'

export interface PostResolutionInterceptor<T = any> {
  intercept(instance: T, ctx: ProviderContext): T
}
