import { v4 } from 'uuid'
import { DI } from '../DI'
import { Inject } from '../Inject'
import { Injectable } from '../Injectable'
import { InjectAll } from '../InjectAll'
import { Named } from '../Named'
import { Optional } from '../Optional.js'
import { Primary } from '../Primary'
import { Bar } from './circular/Bar.js'
import { Foo } from './circular/Foo.js'

describe('DI - Class', function () {
  describe('when using dependencies with default configurations', function () {
    const spy = jest.fn()

    @Injectable()
    class SeeYaService {
      readonly id: string = v4()

      constructor() {
        spy()
      }

      bye(): string {
        return 'bye-bye'
      }
    }

    @Injectable()
    class OkService {
      readonly id: string = v4()

      constructor(private readonly seeYaService: SeeYaService) {
        spy()
      }

      ok(): string {
        return `ok-${this.seeYaService.bye()}`
      }
    }

    @Injectable()
    class Root {
      readonly id: string = v4()

      constructor(readonly seeYaService: SeeYaService, readonly okService: OkService) {
        spy()
      }
    }

    const di = DI.setup()

    it('should register class and resolve it when requested', function () {
      const root = di.resolve(Root)

      expect(root).toBeDefined()
      expect(DI.setup().has(Root)).toBeTruthy()
      expect(root.seeYaService.bye()).toEqual('bye-bye')
      expect(root.okService.ok()).toEqual('ok-bye-bye')
    })

    it('should return singleton instance as default', function () {
      const root1 = di.resolve(Root)
      const root2 = di.resolve(Root)

      expect(root1).toEqual(root2)
      expect(root1.id).toEqual(root2.id)
    })

    it('should construct singleton classes only once', function () {
      expect(spy).toHaveBeenCalledTimes(3)
    })
  })

  describe('when trying to resolve unregistered dependencies', function () {
    class Repo {}

    @Injectable()
    class Service {
      constructor(private readonly repo: Repo) {}
    }

    it.skip('should throw error', function () {
      expect(() => DI.setup().resolve(Service)).toThrow()
    })
  })

  describe('when extending abstract classes', function () {
    describe('and referencing the abstract class on constructor without naming', function () {
      abstract class Base {
        common() {
          return 'base'
        }

        abstract specific(): string
      }

      @Injectable()
      class Concrete extends Base {
        specific(): string {
          return 'concrete'
        }
      }

      @Injectable()
      class Service {
        constructor(readonly dep: Base) {}

        value() {
          return this.dep.specific()
        }
      }

      it('should inject instance based on prototype', function () {
        const service = DI.setup().resolve<Service>(Service)
        expect(service.dep.common()).toEqual('base')
        expect(service.value()).toEqual('concrete')
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
      class Service {
        constructor(@Inject(mongo) readonly repo: Repo) {}

        list() {
          return this.repo.list()
        }
      }

      it('should resolve dependency', function () {
        const service = DI.setup().resolve<Service>(Service)
        expect(service.repo).toBeInstanceOf(MongoRepo)
        expect(service.list()).toEqual('mongodb')
      })
    })
  })

  describe('when there is a circular class dependency', function () {
    describe('and dependencies are decorated with @Lazy()', function () {
      it('should resolve dependencies', function () {
        const foo = DI.setup().resolve(Foo)
        const bar = DI.setup().resolve(Bar)

        expect(foo.test()).toEqual('foo-bar')
        expect(bar.test()).toEqual('bar-foo')
      })
    })
  })

  describe('when injecting many', function () {
    const identifier = Symbol.for('testId')

    abstract class Base {
      abstract hello(): string
    }

    @Injectable()
    @Named(identifier)
    class En extends Base {
      hello(): string {
        return 'hi'
      }
    }

    @Injectable()
    @Named(identifier)
    class Pt extends Base {
      hello(): string {
        return 'oi'
      }
    }

    @Injectable()
    class Lang {
      constructor(@InjectAll(identifier) readonly all: Base[]) {}
    }

    @Injectable()
    class LangByType {
      constructor(@InjectAll(Base) readonly all: Base[]) {}
    }

    it('should resolve class dependency array with all named with the same value', function () {
      const di = DI.setup()
      const lang = di.resolve(Lang)

      expect(lang.all).toHaveLength(2)
      expect(lang.all[0].hello()).toEqual('hi')
      expect(lang.all[1].hello()).toEqual('oi')
    })

    it('should resolve class dependency array with all types that inherits from provided abstract class token type', function () {
      const di = DI.setup()
      const lang = di.resolve(LangByType)

      expect(lang.all).toHaveLength(2)
      expect(lang.all[0].hello()).toEqual('hi')
      expect(lang.all[1].hello()).toEqual('oi')
    })

    it('should resolve all instances that inherits from provided abstract class token type', function () {
      const di = DI.setup()
      const all = di.resolveAll(Base)

      expect(all).toHaveLength(2)
    })
  })

  describe('when multiple there are resolutions for the same token', function () {
    abstract class RootRep {
      abstract value(): string
    }

    @Injectable()
    @Primary()
    class A1 extends RootRep {
      value(): string {
        return 'a1'
      }
    }

    @Injectable()
    class A2 extends RootRep {
      value(): string {
        return 'a2'
      }
    }

    it('should return the resolution decorated with @Primary()', function () {
      const di = DI.setup()
      const a = di.resolve(RootRep)

      expect(a.value()).toEqual('a1')
    })
  })

  describe('using @Optional()', function () {
    class Repo {}

    @Injectable()
    class OptSvc {
      constructor(@Optional() readonly repo?: Repo) {}
    }

    @Injectable()
    class NonSvc {
      constructor(readonly repo?: Repo) {}
    }

    it('should inject null values when dependency cannot be resolved and is marked as optional', function () {
      const di = DI.setup()
      const svc = di.resolve(OptSvc)

      expect(svc.repo).toBeNull()
      expect(() => di.resolve(NonSvc)).toThrow()
    })
  })
})
