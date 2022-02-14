import { expect } from '@jest/globals'
import { check } from '../check.js'

describe('Check', function () {
  it('should throw error when validation is false', function () {
    expect(() => check(false, 'Failure')).toThrow()
  })

  it('should pass when validation is true', function () {
    expect(() => check(true, 'Anything')).not.toThrow()
  })
})
