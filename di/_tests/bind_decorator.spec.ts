import { expect } from '@jest/globals'
import { Bind } from '../decorators/Bind.js'
import { Injectable } from '../decorators/Injectable.js'
import { DI } from '../DI.js'

describe('Bind Decorator', function () {
  describe('decorating with @Bind()', function () {
    @Injectable()
    class Dep {}

    @Bind({ lazy: true, late: true })
    class Bound {
      constructor(readonly dep: Dep) {}
    }

    it('should allow setting several binding configurations at once', function () {
      const di = DI.setup()

      di.bind(Bound).toSelf()

      const bound = di.get(Bound)

      expect(bound).toBeInstanceOf(Bound)
      expect(bound.dep).toBeInstanceOf(Dep)
    })
  })
})
