import { expect } from '@jest/globals'
import { v4 } from 'uuid'
import { jest } from '@jest/globals'
import { Inject } from '../decorators/Inject.js'
import { DI } from '../DI.js'
import { Injectable } from '../decorators/Injectable.js'
import { PreDestroy } from '../decorators/PreDestroy.js'

describe('Basic', function () {
  describe('calling .clear()', function () {
    @Injectable()
    class Dep {}

    it('should remove all registrations', function () {
      const di = DI.setup()
      const has = di.has(Dep)

      di.clear()

      expect(has).toBeTruthy()
      expect(di.has(Dep)).toBeFalsy()
    })
  })

  describe('resetting instances', function () {
    describe('sync', function () {
      const kValue = Symbol('test_reset_value')

      @Injectable()
      class Dep1 {
        readonly id: string = v4()

        constructor(@Inject(kValue) readonly value: string) {}
      }

      @Injectable()
      class Dep2 {
        readonly id: string = v4()
      }

      it('should reset all instances, keeping value providers', function () {
        const di = DI.setup()

        di.bind(kValue).toValue('test')

        const dep11 = di.get(Dep1)
        const dep12 = di.get(Dep1)
        const dep21 = di.get(Dep2)

        di.resetInstances()

        const dep13 = di.get(Dep1)
        const dep22 = di.get(Dep2)

        expect(dep11).toEqual(dep12)
        expect(dep13).not.toEqual(dep11)
        expect(dep21).not.toEqual(dep22)
        expect(dep11.value).toEqual('test')
        expect(dep13.value).toEqual('test')
      })

      it('should reset only the requested instance', function () {
        const di = DI.setup()

        di.bind(kValue).toValue('test')

        const dep1 = di.get(Dep1)
        const dep2 = di.get(Dep2)

        di.resetInstance(Dep1)

        const otherDep1 = di.get(Dep1)
        const otherDep2 = di.get(Dep2)

        expect(dep1).not.toEqual(otherDep1)
        expect(dep2).toEqual(otherDep2)
      })
    })

    describe('async', function () {
      const kValue = Symbol('test_reset_value_async')
      const spy = jest.fn()

      @Injectable()
      class Dep1 {
        readonly id: string = v4()

        constructor(@Inject(kValue) readonly value: string) {}

        @PreDestroy()
        destroy() {
          spy()
        }
      }

      @Injectable()
      class Dep2 {
        readonly id: string = v4()
      }

      @Injectable()
      class Dep3 {
        readonly id: string = v4()
      }

      it('should reset only the requested instance and call destroy hook if any', async function () {
        const di = DI.setup()

        di.bind(kValue).toValue('test')

        const dep1 = di.get(Dep1)
        const dep2 = di.get(Dep2)
        const dep3 = di.get(Dep3)

        await di.resetInstanceAsync(Dep1)
        await di.resetInstanceAsync(Dep2)

        const otherDep1 = di.get(Dep1)
        const otherDep2 = di.get(Dep2)
        const otherDep3 = di.get(Dep3)

        expect(dep1).not.toEqual(otherDep1)
        expect(dep2).not.toEqual(otherDep2)
        expect(dep3).toEqual(otherDep3)
        expect(spy).toHaveBeenCalledTimes(1)
      })
    })
  })
})
