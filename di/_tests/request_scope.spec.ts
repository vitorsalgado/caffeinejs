import Http from 'http'
import { IncomingMessage, ServerResponse } from 'http'
import Supertest from 'supertest'
import { describe } from '@jest/globals'
import { expect } from '@jest/globals'
import { afterAll } from '@jest/globals'
import { jest } from '@jest/globals'
import { beforeEach } from '@jest/globals'
import { v4 } from 'uuid'
import { Injectable } from '../decorators/Injectable.js'
import { RequestScoped } from '../decorators/RequestScoped.js'
import { DI } from '../DI.js'
import { RequestScope } from '../internal/RequestScope.js'
import { DiTypes } from '../DiTypes.js'
import { PostConstruct } from '../decorators/PostConstruct.js'
import { PreDestroy } from '../decorators/PreDestroy.js'
import { Lifecycle } from '../Lifecycle.js'

describe('Request Scope', function () {
  const scope = DI.getScope<RequestScope>(Lifecycle.REQUEST)
  const ctorSpy = jest.fn()
  const initSpy = jest.fn()
  const destroySpy = jest.fn()
  const singletonSpy = jest.fn()

  @Injectable()
  @RequestScoped()
  class Ctrl {
    readonly id: string = v4()

    constructor() {
      ctorSpy()
    }

    value() {
      return 'hello world'
    }

    @PostConstruct()
    init() {
      initSpy()
    }

    @PreDestroy()
    dispose() {
      destroySpy()
    }
  }

  @Injectable()
  class SingletonWithReq {
    constructor(readonly req: Ctrl) {
      singletonSpy()
    }
  }

  const di = DI.setup()

  async function requestListener(req: IncomingMessage, res: ServerResponse) {
    scope.begin()

    const ctrl = di.get(Ctrl)

    res.writeHead(200)
    res.end(ctrl.value())

    await scope.finish()
  }

  const server = Http.createServer(requestListener)

  afterAll(async () => {
    DiTypes.instance().delete(Ctrl)
    server.close()

    await di.finalize()
  })

  beforeEach(() => {
    singletonSpy.mockReset()
    initSpy.mockReset()
    destroySpy.mockReset()
  })

  it('should fail when trying to', function () {
    expect(() => di.get(Ctrl)).toThrow()
  })

  it('should fail when entering twice on request scope', async function () {
    scope.begin()
    expect(() => scope.begin()).toThrow()
    await scope.finish()
  })

  it('should fail when exiting from non entered request scope', function () {
    expect(() => scope.finish()).toThrow()
  })

  describe('non request scoped with a request scope dependency', function () {
    it('should fail to resolve root component when not inside a request scope', function () {
      expect(() => di.get(SingletonWithReq)).toThrow()
    })
  })

  describe('when performing http requests', function () {
    it('should ', async function () {
      const val = 'hello world'

      expect(() => di.get(Ctrl)).toThrow()

      await Supertest(server)
        .get('/')
        .expect(200)
        .expect(res => expect(res.text).toEqual(val))

      await Supertest(server)
        .get('/')
        .expect(200)
        .expect(res => expect(res.text).toEqual(val))

      expect(ctorSpy).toHaveBeenCalledTimes(2)
      expect(initSpy).toHaveBeenCalledTimes(2)
      expect(destroySpy).toHaveBeenCalledTimes(2)

      expect(() => di.get(Ctrl)).toThrow()
    })
  })
})
