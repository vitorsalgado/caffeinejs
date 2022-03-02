import { Environment } from './env/Environment.js'
import { ApplicationContext } from './ApplicationContext.js'

export interface Adapter {
  setupEnvironment(environment: Environment): Environment

  setupApplicationContext(context: ApplicationContext): ApplicationContext

  bootstrap(context: ApplicationContext): Promise<void>
}
