import { InitContext } from '../InitContext.js'
import { Environment } from './Environment.js'

export interface EnvironmentPostProcessor {
  process(environment: Environment, context: InitContext): Promise<void>
}
