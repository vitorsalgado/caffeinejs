import { Adapter } from './Adapter.js'
import { ApplicationContext } from './ApplicationContext.js'
import { Environment } from './env/Environment.js'
import { InitContext } from './InitContext.js'

class SimpleApplicationContext extends ApplicationContext {}

export class SimpleApplicationAdapter implements Adapter<SimpleApplicationContext> {
  adapt(context: InitContext): Promise<SimpleApplicationContext> {
    return Promise.resolve(new SimpleApplicationContext('', 10, context.environment, context.container))
  }

  bootstrap(context: InitContext): Promise<void> {
    return Promise.resolve(undefined)
  }

  setupEnvironment(environment: Environment): Promise<Environment> {
    return Promise.resolve(environment)
  }
}
