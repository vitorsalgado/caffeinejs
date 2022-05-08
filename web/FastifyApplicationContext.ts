import { Server } from 'http'
import { ApplicationContext } from '@caffeinejs/application'
import { Environment } from '@caffeinejs/application'
import { Container } from '@caffeinejs/di'
import { FastifyInstance } from 'fastify'

export class FastifyApplicationContext extends ApplicationContext {
  constructor(readonly fastify: FastifyInstance, environment: Environment, container: Container) {
    super('', 0, environment, container)
  }

  async listen(port: number): Promise<Server> {
    await this.fastify.ready()
    await this.fastify.listen(port, '127.0.0.1')

    return this.fastify.server
  }

  close(): Promise<void> {
    return this.fastify.close()
  }
}
