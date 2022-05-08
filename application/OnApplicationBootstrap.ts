import { InitContext } from './InitContext.js'

export interface OnApplicationBootstrap {
  onApplicationBootstrap(ctx: InitContext): Promise<void>
}
