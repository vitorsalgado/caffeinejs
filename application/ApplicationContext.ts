import { Container } from '@caffeinejs/di'
import { Environment } from './env/Environment.js'

export interface ApplicationContext {
  id: string
  environment: Environment
  container: Container
}
