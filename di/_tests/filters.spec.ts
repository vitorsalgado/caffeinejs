import { expect } from '@jest/globals'
import { Token } from '../Token.js'
import { DI } from '../DI.js'
import { Injectable } from '../decorators/Injectable.js'
import { Optional } from '../decorators/Optional.js'

describe('Filters', function () {
  const kMeta = '__test_filter'

  function Custom(): ClassDecorator {
    return function (target) {
      Reflect.defineMetadata(kMeta, true, target)
    }
  }

  const filter = (token: Token) => Reflect.getOwnMetadata(kMeta, token) === true

  @Injectable()
  class Valid {}

  @Injectable()
  @Custom()
  class NonValid {}

  @Injectable()
  class UsingNonValid {
    constructor(@Optional() readonly nonValid?: NonValid) {}
  }

  describe('using a custom filter', function () {
    describe('when it doesnt match', function () {
      it('should not register the component in the container', function () {
        const di = new DI()

        di.addFilters(filter)
        di.setup()

        expect(di.has(Valid)).toBeTruthy()
        expect(di.has(NonValid)).toBeFalsy()
        expect(di.get(UsingNonValid).nonValid).toBeUndefined()
      })
    })
  })
})
