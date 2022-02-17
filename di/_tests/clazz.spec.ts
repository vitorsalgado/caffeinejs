import { jest } from '@jest/globals'
import { v4 } from 'uuid'
import { Inject } from '../decorators/Inject.js'
import { Injectable } from '../decorators/Injectable.js'
import { InjectAll } from '../decorators/InjectAll.js'
import { Named } from '../decorators/Named.js'
import { Optional } from '../decorators/Optional.js'
import { Primary } from '../decorators/Primary.js'
import { DI } from '../DI'
import { NoUniqueInjectionForTokenError } from '../internal/DiError.js'
import { NoResolutionForTokenError } from '../internal/DiError.js'

describe('Class', function () {
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
      const root = di.get(Root)

      expect(root).toBeDefined()
      expect(DI.setup().has(Root)).toBeTruthy()
      expect(root.seeYaService.bye()).toEqual('bye-bye')
      expect(root.okService.ok()).toEqual('ok-bye-bye')
      expect(spy).toHaveBeenCalledTimes(3)
    })

    it('should return singleton instance as default', function () {
      const root1 = di.get(Root)
      const root2 = di.get(Root)

      expect(root1).toEqual(root2)
      expect(root1.id).toEqual(root2.id)
      expect(spy).toHaveBeenCalledTimes(3)
    })
  })

  describe('when trying to resolve unregistered dependencies', function () {
    class Repo {}

    @Injectable()
    class Service {
      constructor(private readonly repo: Repo) {}
    }

    it('should throw error', function () {
      const di = DI.setup()

      expect(() => di.getRequired(Service)).toThrow(NoResolutionForTokenError)
      expect(() => di.getRequired(Repo)).toThrow(NoResolutionForTokenError)
      expect(di.get(Repo)).toBeUndefined()
    })
  })

  describe('injecting many', function () {
    const kIdentifier = Symbol('testId')

    abstract class Base {
      abstract hello(): string
    }

    @Injectable()
    @Named(kIdentifier)
    class En extends Base {
      hello(): string {
        return 'hi'
      }
    }

    @Injectable()
    @Named(kIdentifier)
    class Pt extends Base {
      hello(): string {
        return 'oi'
      }
    }

    @Injectable()
    class Lang {
      constructor(@InjectAll(kIdentifier) readonly all: Base[]) {}
    }

    @Injectable()
    class LangByType {
      constructor(@InjectAll(Base) readonly all: Base[]) {}
    }

    it('should resolve class dependency array with all named with the same value', function () {
      const di = DI.setup()
      const lang = di.get(Lang)

      expect(lang.all).toHaveLength(2)
      expect(lang.all[0].hello()).toEqual('hi')
      expect(lang.all[1].hello()).toEqual('oi')
    })

    it('should resolve class dependency array with all types that inherits from provided abstract class token type', function () {
      const di = DI.setup()
      const lang = di.get(LangByType)

      expect(lang.all).toHaveLength(2)
      expect(lang.all[0].hello()).toEqual('hi')
      expect(lang.all[1].hello()).toEqual('oi')
    })

    it('should resolve all instances that inherits from provided abstract class token type', function () {
      const di = DI.setup()
      const all = di.getMany(Base)

      expect(all).toHaveLength(2)
    })
  })

  describe('resolving multiple for same token', function () {
    describe('when token is an abstract class', function () {
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
        const a = di.get(RootRep)

        expect(a.value()).toEqual('a1')
      })
    })

    describe('when abstract class has multiple implementations', function () {
      describe('and none is primary', function () {
        abstract class Abs {}

        @Injectable()
        class Impl1 extends Abs {}

        @Injectable()
        class Impl2 extends Abs {}

        it('should throw error for no single match', function () {
          const di = DI.setup()

          expect(() => di.get(Abs)).toThrow(NoUniqueInjectionForTokenError)
        })
      })
    })

    describe('when multiple resolutions exists for a named token', function () {
      const kName = Symbol('svc')

      @Injectable()
      @Named(kName)
      class Svc1 {
        name() {
          return 'svc1'
        }
      }

      @Injectable()
      @Named(kName)
      @Primary()
      class Svc2 {
        name() {
          return 'svc2'
        }
      }

      it('should resolve the primary one', function () {
        const di = DI.setup()
        const dep = di.get<Svc2>(kName)

        expect(dep.name()).toEqual('svc2')
      })
    })

    describe('when no single match', function () {
      const name = 'svc-no-single'

      @Injectable()
      @Named(name)
      class Svc1 {}

      @Injectable()
      @Named(name)
      class Svc2 {}

      it('should throw error', function () {
        const di = DI.setup()

        expect(() => di.get(name)).toThrow(NoUniqueInjectionForTokenError)
      })
    })

    describe('when resolving multiple of non existent', function () {
      it('should return empty array', function () {
        const di = DI.setup()

        expect(di.getMany('nonexistent')).toEqual([])
      })
    })
  })

  describe('optional injections', function () {
    class Repo {}

    interface Service {
      run(): void
    }

    @Injectable()
    class OptSvc {
      constructor(@Optional() readonly repo?: Repo) {}
    }

    @Injectable()
    class NonSvc {
      constructor(readonly repo?: Repo) {}
    }

    @Injectable()
    class Ctrl {
      constructor(@Inject('service') @Optional() readonly service?: Service) {}
    }

    it('should inject null values when dependency cannot be resolved and is marked as optional', function () {
      const di = DI.setup()
      const svc = di.get(OptSvc)
      const ctrl = di.get(Ctrl)

      expect(svc.repo).toBeNull()
      expect(() => di.get(NonSvc)).toThrow()
      expect(ctrl.service).toBeNull()
    })
  })

  describe('nested resolution graph', function () {
    describe('and using singleton scope for all', function () {
      @Injectable()
      class Dep {
        readonly id: string = v4()
      }

      @Injectable()
      class Repo {
        readonly id: string = v4()

        constructor(readonly dep: Dep) {}
      }

      @Injectable()
      class Service {
        readonly id: string = v4()

        constructor(readonly repo: Repo, readonly dep: Dep) {}
      }

      @Injectable()
      class Controller {
        readonly id: string = v4()

        constructor(readonly dep: Dep, readonly service: Service, readonly repo: Repo) {}
      }

      it('should resolve with same instance from previous resolutions', function () {
        const di = DI.setup()

        const controller = di.get(Controller)
        const service = di.get(Service)
        const repo = di.get(Repo)
        const dep = di.get(Dep)

        expect(controller.dep).toEqual(dep)
        expect(controller.repo).toEqual(repo)
        expect(controller.service).toEqual(service)
        expect(service.dep).toEqual(dep)
        expect(service.repo).toEqual(repo)
        expect(repo.dep).toEqual(dep)
      })
    })
  })
})
