import { ResolutionContext } from './ResolutionContext.js'

export interface PostProcessor {
  beforeInit(instance: unknown, ctx: ResolutionContext): unknown

  afterInit(instance: unknown, ctx: ResolutionContext): unknown
}
