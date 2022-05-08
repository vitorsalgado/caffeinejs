import { InitContext } from './InitContext.js'

export interface OnApplicationSetup {
  onApplicationSetup(ctx: InitContext): Promise<void>
}
