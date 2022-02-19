import { v4 } from 'uuid'
import { expect } from '@jest/globals'
import { Lifecycle } from '../Lifecycle.js'
import { Lookup } from '../decorators/Lookup.js'
import { noop } from '../noop.js'
import { DI } from '../DI.js'
import { InvalidBindingError } from '../internal/errors.js'
import { InvalidInjectionToken } from '../internal/errors.js'
import { Injectable } from '../decorators/Injectable.js'
import { ScopedAs } from '../decorators/ScopedAs.js'

describe('Lookup', function () {
  @Injectable()
  class Dep {
    readonly id: string = v4()
  }

  @Injectable()
  @ScopedAs(Lifecycle.TRANSIENT)
  class TransientDep {
    readonly id: string = v4()
  }

  class Base {}

  @Injectable()
  class Impl1 extends Base {}

  @Injectable()
  class Impl2 extends Base {}

  describe('setting lookup on getters', function () {
    @Injectable()
    class Root {
      constructor() {}

      @Lookup()
      get dep(): Dep {
        return noop()
      }

      @Lookup()
      private get transient(): TransientDep {
        return noop<TransientDep>()
      }

      @Lookup(Base, { multiple: true })
      get many(): Array<Base> {
        return noop()
      }

      getTransient() {
        return this.transient
      }
    }

    it('should return component based on its scope, not the holder component', function () {
      const di = DI.setup()
      const root1 = di.get(Root)
      const root2 = di.get(Root)

      expect(root1.dep.id).toEqual(root1.dep.id)
      expect(root1.dep.id).toEqual(root2.dep.id)
      expect(root1.getTransient().id).not.toEqual(root1.getTransient().id)
    })

    it('should return all resolutions from a token', function () {
      const di = DI.setup()
      const root = di.get(Root)

      expect(root.many).toHaveLength(2)
      expect(root.many.every(x => x instanceof Base)).toBeTruthy()
    })

    describe('invalid configurations', function () {
      it('should fail when setting more then lookup on same property', function () {
        expect(() => {
          @Injectable()
          class Fail {
            @Lookup('test')
            @Lookup('test')
            get test() {
              return null
            }
          }
        }).toThrow(InvalidBindingError)
      })

      it('should fail when no injection is defined', function () {
        expect(() => {
          @Injectable()
          class Fail {
            @Lookup(true as any)
            get noToken() {
              return undefined
            }
          }
        }).toThrow(InvalidInjectionToken)
      })
    })
  })

  describe('setting lookup on method', function () {
    @Injectable()
    class Lk {
      @Lookup(Dep)
      getDep(): Dep {
        return noop()
      }

      @Lookup(Base, { multiple: true })
      getMany() {
        return noop<Array<Base>>()
      }
    }

    it('should return components from lookup method respecting their own scope definition', function () {
      const di = DI.setup()
      const root1 = di.get(Lk)
      const root2 = di.get(Lk)

      expect(root1.getDep().id).toEqual(root1.getDep().id)
      expect(root1.getDep().id).toEqual(root2.getDep().id)
      expect(root1.getMany()).toHaveLength(2)
      expect(root1.getMany().every(x => x instanceof Base)).toBeTruthy()
    })

    describe('invalid configurations', function () {
      it('should fail when injection token is undefined on method definition', function () {
        expect(() => {
          @Injectable()
          class Fail {
            @Lookup()
            getTest() {
              return noop()
            }
          }
        }).toThrow()
      })
    })
  })
})
