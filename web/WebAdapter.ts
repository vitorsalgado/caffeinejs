import { Adapter } from '@caffeinejs/application'
import { InitContext } from '@caffeinejs/application'
import { Environment } from '@caffeinejs/application'
import { R } from '@caffeinejs/std'
import fastify from 'fastify'
import { HTTPMethods } from 'fastify'
import { Vars } from './internal/Vars.js'
import { FastifyApplicationContext } from './FastifyApplicationContext.js'
import { Route } from './Route.js'
import { Context } from './Context.js'

export class WebAdapter implements Adapter<FastifyApplicationContext, Environment> {
  setupEnvironment(environment: Environment): Promise<Environment> {
    return Promise.resolve(environment)
  }

  bootstrap(ctx: InitContext): Promise<void> {
    return Promise.resolve(undefined)
  }

  adapt(ctx: InitContext): Promise<FastifyApplicationContext> {
    const fastifyInstance = fastify()
    const tokens = ctx.container
      .search(token => typeof token === 'function' && R.hasOwn(Vars.CONTROLLER, token))
      .map(x => x.token)

    for (const token of tokens) {
      for (const method of R.getOwn<[string | symbol]>(Vars.CONTROLLER_ROUTES, token) || []) {
        const route = R.getOwn<Route>(Vars.ROUTE, token, method)

        if (!route) {
          continue
        }

        const controller = ctx.container.get(token)

        fastifyInstance.route({
          url: route.path,
          method: route.method as HTTPMethods,
          handler: async (request, reply) => {
            const context: Context = { request, response: { status: 100 }, param: '' }
            const pickers = route.parameters.filter(x => x.picker)

            if (pickers.length > 1) {
              throw new Error('More than 1 picker declared')
            }

            const resolvers = route.parameters.sort((a, b) => Number(b.picker) - Number(a.picker))
            const params = []
            let param

            for (const resolver of resolvers) {
              param = resolver.handler.handle({ request, response: { status: 200 }, param })
              params.push(param)
            }

            reply.send(controller[method](...params))
          },
        })
      }
    }

    return Promise.resolve(new FastifyApplicationContext(fastifyInstance, ctx.environment, ctx.container) as any)
  }
}
