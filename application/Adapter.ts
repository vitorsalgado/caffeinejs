import { Environment } from './env/Environment.js'
import { ApplicationContext } from './ApplicationContext.js'
import { InitContext } from './InitContext.js'

export interface Adapter<TApp extends ApplicationContext, TEnv extends Environment = Environment> {
  setupEnvironment(environment: Environment): Promise<TEnv>

  bootstrap(initContext: InitContext): Promise<void>

  adapt(initContext: InitContext): Promise<TApp>
}
