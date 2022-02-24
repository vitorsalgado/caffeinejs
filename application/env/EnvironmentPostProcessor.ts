import { ApplicationContext } from '../ApplicationContext.js'
import { Environment } from './Environment.js'

export interface EnvironmentPostProcessor {
  process(environment: Environment, context: ApplicationContext): Promise<void>
}
