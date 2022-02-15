import { ProviderContext } from './internal/Provider.js'

export interface PostProcessor {
  beforeInit(instance: unknown, ctx: ProviderContext): unknown

  afterInit(instance: unknown, ctx: ProviderContext): unknown
}
