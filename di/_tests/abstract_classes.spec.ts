import { Inject } from '../decorators/Inject.js'
import { Injectable } from '../decorators/Injectable.js'
import { Named } from '../decorators/Named.js'
import { ScopedAs } from '../decorators/ScopedAs.js'
import { DI } from '../DI.js'
import { Scopes } from '../Scopes.js'

describe('Abstract Classes', function () {
  describe('using abstract classes as token', function () {
    describe('and referencing the abstract class on constructor without naming', function () {
      const spy = jest.fn()

      abstract class Base {
        common() {
          return 'base'
        }

        abstract specific(): string
      }

      @Injectable()
      class Concrete extends Base {
        constructor() {
          super()
          spy()
        }

        specific(): string {
          return 'concrete'
        }
      }

      @Injectable()
      @ScopedAs(Scopes.TRANSIENT)
      class Service {
        constructor(readonly dep: Base) {}

        value() {
          return this.dep.specific()
        }
      }

      const di = DI.setup()

      it('should inject instance based on prototype', function () {
        const service = di.get<Service>(Service)

        expect(service.dep.common()).toEqual('base')
        expect(service.value()).toEqual('concrete')
      })

      it('should construct concrete class implementation one time when it is singleton', function () {
        const service = di.get<Service>(Service)
        di.get<Service>(Service)
        di.get<Service>(Service)

        expect(service).toBeInstanceOf(Service)
        expect(spy).toHaveBeenCalledTimes(1)
      })
    })

    describe('and referencing dependencies by name', function () {
      const mongo = Symbol('mongodb')

      abstract class Repo {
        abstract list(): string
      }

      @Injectable()
      @Named('sql')
      class MySqlRepo extends Repo {
        list(): string {
          return 'mysql'
        }
      }

      @Injectable()
      @Named(mongo)
      class MongoRepo extends Repo {
        list(): string {
          return 'mongodb'
        }
      }

      @Injectable()
      class DbService {
        constructor(@Inject(mongo) readonly repo: Repo) {}

        list() {
          return this.repo.list()
        }
      }

      it('should resolve dependency', function () {
        const service = DI.setup().get<DbService>(DbService)
        expect(service.repo).toBeInstanceOf(MongoRepo)
        expect(service.list()).toEqual('mongodb')
      })
    })
  })
})
