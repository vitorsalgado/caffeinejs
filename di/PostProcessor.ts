import { ResolutionContext } from './ResolutionContext.js'

export interface PostProcessor<A = unknown> {
  beforeInit(instance: unknown, ctx: ResolutionContext<A>): unknown

  afterInit(instance: unknown, ctx: ResolutionContext<A>): unknown
}
