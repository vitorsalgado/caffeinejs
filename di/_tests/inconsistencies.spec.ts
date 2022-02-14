import { expect } from '@jest/globals'
import { Configuration } from '../decorators/Configuration.js'
import { Injectable } from '../decorators/Injectable.js'
import { InvalidBindingError } from '../DiError.js'

describe('Inconsistencies', function () {
  it('should fail when passing a non named token to injectable', function () {
    expect(() => {
      class Ref {}

      @Injectable(Ref)
      class Fail {}
    }).toThrow(InvalidBindingError)
  })

  it('should fail when using injectable on method level without passing a valid token', function () {
    expect(() => {
      @Configuration()
      class Conf {
        @Injectable()
        provide() {
          return ''
        }
      }
    }).toThrow(InvalidBindingError)
  })
})
