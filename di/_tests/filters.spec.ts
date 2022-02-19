import { expect } from '@jest/globals'
import { Filter } from '../Filter.js'
import { Token } from '../Token.js'
import { Binding } from '../Binding.js'
import { Injectable } from '../decorators/index.js'
import { DI } from '../DI.js'
import { Optional } from '../decorators/index.js'

describe('Filters', function () {
  const kMeta = '__test_filter'

  function Custom(): ClassDecorator {
    return function (target) {
      Reflect.defineMetadata(kMeta, true, target)
    }
  }

  class CustomFilter implements Filter {
    match(token: Token, binding: Binding): boolean {
      return Reflect.getOwnMetadata(kMeta, token) === true
    }
  }

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
        DI.addFilters(new CustomFilter())

        const di = DI.setup()

        expect(di.has(Valid)).toBeTruthy()
        expect(di.has(NonValid)).toBeFalsy()
        expect(di.get(UsingNonValid).nonValid).toBeUndefined()
      })
    })
  })
})
