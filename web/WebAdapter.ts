import { Adapter } from '@caffeinejs/application'
import { ApplicationContext } from '@caffeinejs/application'
import { Environment } from '@caffeinejs/application/dist/env/Environment.js'
import { R } from '@caffeinejs/std'
import Fastify from 'fastify'
import { Vars } from './internal/Vars.js'

const fastify = Fastify()

export abstract class WebAdapter implements Adapter {
  bootstrap(context: ApplicationContext): Promise<void> {
    const controllers = context.container.search(token => R.hasOwn(Vars.CONTROLLER, token))

    return Promise.resolve(undefined)
  }

  setupApplicationContext(context: ApplicationContext): ApplicationContext {
    return context
  }

  setupEnvironment(environment: Environment): Environment {
    return environment
  }
}
