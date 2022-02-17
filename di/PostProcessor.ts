import { ProviderContext } from './Provider.js'

export interface PostProcessor {
  beforeInit(instance: unknown, ctx: ProviderContext): unknown

  afterInit(instance: unknown, ctx: ProviderContext): unknown
}
