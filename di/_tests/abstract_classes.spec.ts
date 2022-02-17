import { expect } from '@jest/globals'
import { jest } from '@jest/globals'
import { v4 } from 'uuid'
import { Extends } from '../decorators/Extends.js'
import { Inject } from '../decorators/Inject.js'
import { Injectable } from '../decorators/Injectable.js'
import { Named } from '../decorators/Named.js'
import { ScopedAs } from '../decorators/ScopedAs.js'
import { DI } from '../DI.js'
import { Lifecycle } from '../Lifecycle.js'
import { TransientScoped } from '../decorators/index.js'

describe('Abstract Classes', function () {
  describe('when referencing the abstract class on constructor without naming', function () {
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
    @ScopedAs(Lifecycle.TRANSIENT)
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

  describe('when referencing dependencies by name', function () {
    const kMongo = Symbol.for('mongodb')
    const kSql = Symbol.for('sql')

    abstract class Repo {
      abstract list(): string
    }

    @Injectable()
    @Named(kSql)
    class MySqlRepo extends Repo {
      list(): string {
        return 'mysql'
      }
    }

    @Injectable()
    @Named(kMongo)
    class MongoRepo extends Repo {
      list(): string {
        return 'mongodb'
      }
    }

    @Injectable()
    class DbService {
      constructor(@Inject(kMongo) readonly repo: Repo) {}

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

  describe('using extends decorator to explicitly ref the abstract class', function () {
    abstract class Base {
      abstract test(): string
    }

    @Injectable()
    @Extends(Base)
    class Impl extends Base {
      readonly id: string = v4()

      test(): string {
        return 'ok'
      }
    }

    it('should resolve instance based on abstract class token', function () {
      const di = DI.setup()
      const impl1 = di.get<Impl>(Base)
      const impl2 = di.get<Impl>(Base)

      expect(impl1).toBeInstanceOf(Impl)
      expect(impl1.test()).toEqual('ok')
      expect(impl1.id).toEqual(impl2.id)
    })
  })

  describe('transient abstract', function () {
    abstract class Base {
      readonly id: string = v4()
    }

    @Injectable()
    @Extends(Base)
    @TransientScoped()
    class Impl extends Base {}

    it('should resolve using the correct scope', function () {
      const di = DI.setup()
      const impl1 = di.get(Base)
      const impl2 = di.get(Base)

      expect(impl1.id).not.toEqual(impl2.id)
    })
  })
})
