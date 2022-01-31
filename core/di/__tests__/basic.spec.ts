import { v4 } from 'uuid'
import { DI } from '../DI.js'
import { Injectable } from '../decorators/Injectable.js'

describe('DI - Basic', function () {
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

  describe('calling .resetInstances()', function () {
    @Injectable()
    class Dep {
      readonly id: string = v4()
    }

    it('should reset instances', function () {
      const di = DI.setup()
      const dep1 = di.resolve(Dep)
      const dep2 = di.resolve(Dep)

      di.resetInstances()

      const dep3 = di.resolve(Dep)

      expect(dep1).toEqual(dep2)
      expect(dep3).not.toEqual(dep1)
    })
  })
})
