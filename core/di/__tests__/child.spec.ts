import { v4 } from 'uuid'
import { DI } from '../DI.js'
import { Injectable } from '../Injectable.js'
import { Lifecycle } from '../Lifecycle.js'
import { Scope } from '../Scope.js'

describe('DI - Child', function () {
  describe('when creating a child container', function () {
    @Injectable()
    @Scope(Lifecycle.CONTAINER)
    class Cont {
      readonly id: string = v4()
    }

    @Injectable()
    class NonCont {
      readonly id: string = v4()
    }

    it.skip('should resolve a instance per per container when lifecycle is CONTAINER', function () {
      const di = DI.setup()
      const cont1 = di.resolve(Cont)
      const nonCont1 = di.resolve(NonCont)
      const child = di.child()
      const cont2 = child.resolve(Cont)
      const nonCont2 = child.resolve(NonCont)

      const cont3 = di.resolve(Cont)
      const cont4 = child.resolve(Cont)
      const nonCont3 = di.resolve(NonCont)

      expect(di.has(Cont)).toBeTruthy()
      expect(di.has(NonCont)).toBeTruthy()
      expect(child.has(Cont)).toBeTruthy()
      expect(child.has(NonCont)).toBeFalsy()
      expect(child.has(NonCont, true)).toBeTruthy()
      expect(cont1).not.toEqual(cont2)
      expect(cont1).toEqual(cont3)
      expect(cont2).toEqual(cont4)
      expect(nonCont1).toEqual(nonCont2)
      expect(nonCont2).toEqual(nonCont3)
    })
  })
})
