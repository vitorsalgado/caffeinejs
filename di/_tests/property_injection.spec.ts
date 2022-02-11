import { expect } from '@jest/globals'
import { Inject } from '../decorators/Inject.js'
import { Injectable } from '../decorators/Injectable.js'
import { Named } from '../decorators/Named.js'
import { DI } from '../DI.js'

describe('Property Injection', function () {
  const kValue = Symbol('value')
  const kNamedDep = Symbol('named-dep')

  @Injectable()
  class Dep {
    test() {
      return 'ok'
    }
  }

  interface Contract {
    run(): string
  }

  @Injectable()
  @Named(kNamedDep)
  class NamedDep implements Contract {
    run() {
      return 'ran'
    }
  }

  describe('when class has only property injections', function () {
    @Injectable()
    class PropertyOnly {
      @Inject()
      dep!: Dep

      @Inject(kValue)
      value!: string

      @Inject(kNamedDep)
      namedDep!: Contract

      constructor() {
        expect(this.dep).toBeUndefined()
        expect(this.value).toBeUndefined()
        expect(this.namedDep).toBeUndefined()
      }
    }

    it('should construct class and resolve property dependencies', function () {
      const di = DI.setup()
      di.bind(kValue).toValue('test')

      const root = di.get(PropertyOnly)

      expect(root).toBeInstanceOf(PropertyOnly)
      expect(root.dep).toBeInstanceOf(Dep)
      expect(root.dep.test()).toEqual('ok')
      expect(root.value).toEqual('test')
      expect(root.namedDep.run()).toEqual('ran')
    })
  })

  describe('when class has both constructor and property injections', function () {
    @Injectable()
    class CtorAndProperties {
      @Inject()
      dep!: Dep

      @Inject(kValue)
      value!: string

      constructor(@Inject(kNamedDep) readonly namedDep: Contract) {
        expect(this.dep).toBeUndefined()
        expect(this.value).toBeUndefined()
        expect(this.namedDep).toBeDefined()
      }
    }

    it('should instantiate class injecting constructor dependencies and then inject property dependencies', function () {
      const di = DI.setup()
      di.bind(kValue).toValue('test')

      const root = di.get(CtorAndProperties)

      expect(root).toBeInstanceOf(CtorAndProperties)
      expect(root.dep).toBeInstanceOf(Dep)
      expect(root.dep.test()).toEqual('ok')
      expect(root.value).toEqual('test')
      expect(root.namedDep.run()).toEqual('ran')
    })
  })

  describe('when properties are private', function () {
    @Injectable()
    class PrivateTest {
      @Inject()
      private _dep!: Dep

      @Inject(kValue)
      private _value!: string

      #namedDep!: Contract

      constructor() {
        expect(this._dep).toBeUndefined()
        expect(this._value).toBeUndefined()
        expect(this.#namedDep).toBeUndefined()
      }

      get dep(): Dep {
        return this._dep
      }

      get value(): string {
        return this._value
      }

      @Inject(kNamedDep)
      get namedDep(): Contract {
        return this.#namedDep
      }

      set namedDep(value: Contract) {
        this.#namedDep = value
      }
    }

    it('should inject values any type of private property', function () {
      const di = DI.setup()
      di.bind(kValue).toValue('test')

      const root = di.get(PrivateTest)

      expect(root).toBeInstanceOf(PrivateTest)
      expect(root.dep).toBeInstanceOf(Dep)
      expect(root.dep.test()).toEqual('ok')
      expect(root.value).toEqual('test')
      expect(root.namedDep.run()).toEqual('ran')
    })
  })
})
