import { ApplicationContext } from './ApplicationContext.js'

export interface OnApplicationBootstrap {
  onApplicationBootstrap(ctx: ApplicationContext): Promise<void>
}
