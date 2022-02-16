import { expect } from '@jest/globals'
import { v4 } from 'uuid'
import { Inject } from '../decorators/Inject.js'
import { Injectable } from '../decorators/Injectable.js'
import { InjectAll } from '../decorators/InjectAll.js'
import { Named } from '../decorators/Named.js'
import { ScopedAs } from '../decorators/ScopedAs.js'
import { DI } from '../DI.js'
import { Lifecycle } from '../Lifecycle.js'

describe('Method Injections', function () {
  const kVal = Symbol('testVal')
  const kBase = Symbol('base')

  @Injectable()
  @ScopedAs(Lifecycle.TRANSIENT)
  class TransientDep {
    readonly id: string = v4()
  }

  @Injectable()
  class SingletonDep {
    readonly id: string = v4()
  }

  abstract class Base {
    abstract test(): string
  }

  @Injectable()
  class B1 extends Base {
    test(): string {
      return 'b1'
    }
  }

  @Injectable()
  @Named(kBase)
  class B2 extends Base {
    test(): string {
      return 'b2'
    }
  }

  describe('when setting a transient dependency in a singleton component', function () {
    @Injectable()
    class SingleInject {
      id: string = v4()
      transient!: TransientDep

      @Inject()
      setOneParameter(transient: TransientDep) {
        this.transient = transient
      }
    }

    it('should inject a transient dependency just one time', function () {
      const di = DI.setup()

      const r1 = di.get(SingleInject)
      const id1 = r1.transient.id
      const r2 = di.get(SingleInject)
      const id2 = r2.transient.id

      expect(r1).toBeInstanceOf(SingleInject)
      expect(r1.id).toEqual(r2.id)
      expect(r1.transient).toBeInstanceOf(TransientDep)
      expect(r2.transient).toBeInstanceOf(TransientDep)
      expect(r1.transient.id).toEqual(r2.transient.id)
      expect(id1).toEqual(id2)
    })
  })

  describe('when setting a singleton dependency in a transient component', function () {
    @Injectable()
    @ScopedAs(Lifecycle.TRANSIENT)
    class Tr {
      id: string = v4()
      dep!: SingletonDep

      @Inject()
      setDep(dep: SingletonDep) {
        this.dep = dep
      }
    }

    it('should init class on every resolution and inject the same singleton dependency', function () {
      const di = DI.setup()
      const res1 = di.get(Tr)
      const res2 = di.get(Tr)

      expect(res1).toBeInstanceOf(Tr)
      expect(res2).toBeInstanceOf(Tr)
      expect(res1.id).not.toEqual(res2.id)
      expect(res1.dep.id).toEqual(res2.dep.id)
    })
  })

  describe('when setter method contains multiple and different injection types', function () {
    @Injectable()
    class Comp {
      transient!: TransientDep
      val!: string
      bases!: Base[]

      @Inject()
      setDiff(transient: TransientDep, @Inject(kVal) val: string, @InjectAll(Base) bases: Base[]) {
        this.transient = transient
        this.val = val
        this.bases = bases
      }
    }

    it('should resolve and inject all parameters', function () {
      const di = DI.setup()

      di.bind(kVal).toValue('test')

      const instance = di.get(Comp)

      expect(instance).toBeInstanceOf(Comp)
      expect(instance.transient).toBeInstanceOf(TransientDep)
      expect(instance.val).toEqual('test')
      expect(instance.bases).toHaveLength(2)
    })
  })

  describe('when class contains multiple setter methods', function () {
    @Injectable()
    class Test {
      id: string = v4()
      transient!: TransientDep
      val!: string
      bases!: Base[]
      base!: Base

      @Inject()
      setTransient(transient: TransientDep) {
        this.transient = transient
      }

      @Inject()
      setValue(@Inject(kVal) val: string) {
        this.val = val
      }

      @Inject()
      setBase(@InjectAll(Base) bases: Base[], @Inject(kBase) base: Base) {
        this.bases = bases
        this.base = base
      }
    }

    it('should inject dependencies in all setter methods', function () {
      const di = DI.setup()

      di.bind(kVal).toValue('test')

      const r1 = di.get(Test)
      const id1 = r1.transient.id
      const r2 = di.get(Test)
      const id2 = r2.transient.id

      expect(r1).toBeInstanceOf(Test)
      expect(r1.id).toEqual(r2.id)
      expect(r1.transient).toBeInstanceOf(TransientDep)
      expect(r2.transient).toBeInstanceOf(TransientDep)
      expect(r1.transient.id).toEqual(r2.transient.id)
      expect(id1).toEqual(id2)
      expect(r1.val).toEqual('test')
      expect(r1.bases).toHaveLength(2)
      expect(r1.base).toBeInstanceOf(B2)
    })
  })

  describe('given the injection order, constructor, properties and setter methods', function () {
    const kValue = Symbol('value')
    const kMethodValue = Symbol('method_value')

    @Injectable()
    class Dep {
      @Inject(kValue)
      value!: string
      methodValue!: string

      @Inject()
      setMethodValue(@Inject(kMethodValue) methodValue: string) {
        expect(this.value).toEqual('test')
        this.methodValue = methodValue
      }
    }

    it('should inject dependencies on setter methods after property injections', function () {
      const di = DI.setup()

      di.bind(kValue).toValue('test')
      di.bind(kMethodValue).toValue('method_test')

      const res = di.get(Dep)

      expect(res.value).toEqual('test')
      expect(res.methodValue).toEqual('method_test')
    })
  })
})
