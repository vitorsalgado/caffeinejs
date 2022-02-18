import { ResolutionContext } from './internal/index.js'

export interface PostProcessor {
  beforeInit(instance: unknown, ctx: ResolutionContext): unknown

  afterInit(instance: unknown, ctx: ResolutionContext): unknown
}
