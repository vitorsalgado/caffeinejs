import { Container } from '@caffeinejs/di'
import { Environment } from './env/Environment.js'

export class InitContext {
  constructor(
    readonly id: string,
    readonly startedAt: number,
    readonly environment: Environment,
    readonly container: Container,
  ) {}
}
