import { Adapter } from '@caffeinejs/application'
import { ApplicationContext } from '@caffeinejs/application'
import { Environment } from '@caffeinejs/application/dist/env/Environment.js'
import { R } from '@caffeinejs/std'
import Fastify from 'fastify'
import { InitContext } from '@caffeinejs/application'
import { Vars } from './internal/Vars.js'

const fastify = Fastify()

export abstract class WebAdapter implements Adapter<ApplicationContext> {
  setupEnvironment(environment: Environment): Promise<Environment> {
    return Promise.resolve(environment)
  }

  bootstrap(context: InitContext): Promise<void> {
    const controllers = context.container.search(token => R.hasOwn(Vars.CONTROLLER, token))

    return Promise.resolve(undefined)
  }

  adapt(context: ApplicationContext): Promise<ApplicationContext> {
    throw new Error('Method not implemented.')
  }
}
