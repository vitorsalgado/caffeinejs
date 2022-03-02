import { ApplicationContext } from './ApplicationContext.js'

export interface OnApplicationSetup {
  onApplicationSetup(ctx: ApplicationContext): Promise<void>
}
