import 'reflect-metadata'
import Fastify from 'fastify'
import cronometro from 'cronometro'
import Supertest from 'supertest'
import { printResults } from '@caffeinejs/internal-perf'
import { DI } from '../DI.js'
import { Injectable } from '../decorators/Injectable.js'
import { RequestScope } from '../internal/scopes/RequestScope.js'
import { RequestScoped } from '../decorators/RequestScoped.js'
import { Lifecycle } from '../Lifecycle.js'
import { Transient } from '../decorators/Transient.js'
import { parallelRequests } from './vars.js'
import { errorThreshold } from './vars.js'
import { connections } from './vars.js'
import { iterations } from './vars.js'

abstract class Repo {
  abstract find(): string
}

@Injectable()
class RepoImpl extends Repo {
  find(): string {
    return 'repository'
  }
}

@Injectable()
class Service {
  constructor(private readonly repo: Repo) {}

  find() {
    return `service_${this.repo.find()}`
  }
}

@Injectable()
@RequestScoped()
class Controller {
  constructor(private readonly service: Service) {}

  find() {
    return `controller_${this.service.find()}`
  }
}

@Injectable()
class SingletonController {
  constructor(private readonly service: Service) {}

  find() {
    return `controller_${this.service.find()}`
  }
}

@Injectable()
@Transient()
class TrRepo {
  find() {
    return 'repository'
  }
}

@Injectable()
@Transient()
class TrService {
  constructor(readonly repo: TrRepo) {}

  find() {
    return `service_${this.repo.find()}`
  }
}

@Injectable()
@Transient()
class TrController {
  constructor(readonly service: TrService) {}

  find() {
    return `controller_${this.service.find()}`
  }
}

const di = DI.setup()
const scope = DI.getScope<RequestScope>(Lifecycle.REQUEST)
const controller = new Controller(new Service(new RepoImpl()))
const fastify = Fastify()

fastify.get('/request', async (req, res) => {
  scope.begin()

  res.status(200).send(di.get(Controller).find())

  await scope.finish()
})

fastify.get('/request-with-singleton', async (req, res) => {
  scope.begin()

  res.status(200).send(di.get(SingletonController).find())

  await scope.finish()
})

fastify.get('/singleton', (req, res) => {
  res.status(200).send(di.get(SingletonController).find())
})

fastify.get('/singleton-no-container', (req, res) => {
  res.send(controller.find())
})

fastify.get('/no-container', (req, res) => {
  res.status(200).send(new Controller(new Service(new RepoImpl())).find())
})

fastify.get('/transient', (req, res) => {
  res.status(200).send(di.get(TrController).find())
})

await fastify.ready()

export function makeParallelRequests(n: number, callback: any): Promise<unknown> {
  return Promise.all(Array.from(Array(n)).map(() => new Promise(callback)))
}

cronometro(
  {
    transient() {
      return makeParallelRequests(parallelRequests, (callback: any) =>
        Supertest(fastify.server).get('/transient').expect(200).end(callback)
      )
    },

    'singleton-no-container'() {
      return makeParallelRequests(parallelRequests, (callback: any) =>
        Supertest(fastify.server).get('/singleton-no-container').expect(200).end(callback)
      )
    },

    singleton() {
      return makeParallelRequests(parallelRequests, (callback: any) =>
        Supertest(fastify.server).get('/singleton').expect(200).end(callback)
      )
    },

    request() {
      return makeParallelRequests(parallelRequests, (callback: any) =>
        Supertest(fastify.server).get('/request').expect(200).end(callback)
      )
    },

    'request-with-singleton'() {
      return makeParallelRequests(parallelRequests, (callback: any) =>
        Supertest(fastify.server).get('/request-with-singleton').expect(200).end(callback)
      )
    },

    'no-container'() {
      return makeParallelRequests(parallelRequests, (callback: any) =>
        Supertest(fastify.server).get('/no-container').expect(200).end(callback)
      )
    }
  },
  {
    iterations,
    errorThreshold
  },
  (err, results) => {
    if (err) {
      throw err
    }

    console.log(printResults(connections, results))
  }
)
