import { Injectable } from '../decorators/Injectable.js'
import { Optional } from '../decorators/Optional.js'
import { Inject } from '../decorators/Inject.js'
import { DI } from '../DI.js'

describe('Optional Injections', function () {
  describe('with no default values', function () {
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

    it('should inject undefined values when dependency cannot be resolved and is marked as optional', function () {
      const di = DI.setup()
      const svc = di.get(OptSvc)
      const ctrl = di.get(Ctrl)

      expect(svc.repo).toBeUndefined()
      expect(svc.repo).not.toBe(null)
      expect(() => di.get(NonSvc)).toThrow()
      expect(ctrl.service).toBeUndefined()
      expect(ctrl.service).not.toBe(null)
    })
  })

  describe('with default values', function () {
    const kVal = Symbol('test')

    class Dep {
      constructor(readonly value: string) {}
    }

    @Injectable()
    class Reg {}

    @Injectable()
    class OptStr {
      constructor(@Inject(kVal) @Optional() readonly value: string = 'optional') {}
    }

    @Injectable()
    class Test {
      constructor(readonly reg: Reg, @Optional() readonly dep: Dep = new Dep('default value')) {}
    }

    it('should keep the optional value', function () {
      const di = DI.setup()
      const optStr = di.get(OptStr)
      const test = di.get(Test)

      expect(optStr.value).toEqual('optional')
      expect(test.reg).toBeInstanceOf(Reg)
      expect(test.dep).toBeInstanceOf(Dep)
      expect(test.dep.value).toEqual('default value')
    })
  })
})
