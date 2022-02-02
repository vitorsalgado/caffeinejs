import { Configuration } from '../decorators/Configuration.js'
import { DI } from '../DI'
import { Provides } from '../decorators/Provides.js'
import { Injectable } from '../decorators/Injectable.js'

describe('DI - Factory', function () {
  describe('using java @Bean like registration with @Configuration() class', function () {
    describe('and using class binding', function () {
      const spy = jest.fn()

      @Injectable()
      class Repo {
        constructor() {
          spy()
        }

        list() {
          return 'listed'
        }
      }

      @Injectable()
      class Listener {
        constructor() {
          spy()
        }

        listen() {
          return 'listened'
        }
      }

      class Service {
        constructor(readonly repo: Repo, readonly listener: Listener) {
          spy()
        }
      }

      @Configuration()
      class Beans {
        constructor(private readonly listener: Listener) {
          spy()
        }

        @Provides(Service)
        service(repo: Repo): Service {
          return new Service(repo, this.listener)
        }
      }

      it('should return instance from method decorated with @Provides() based on class ref', function () {
        const service = DI.setup().get(Service)

        expect(service).toBeDefined()
        expect(service.repo.list()).toEqual('listed')
        expect(service.listener.listen()).toEqual('listened')
        expect(spy).toHaveBeenCalledTimes(4)
      })
    })
  })
})
