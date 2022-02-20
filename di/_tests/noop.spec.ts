import { expect } from '@jest/globals'
import { noop } from '../noop.js'

describe('noop', function () {
  it('should do nothing', function () {
    const value = { message: 'test' }
    const after = noop(value)

    expect(after).toBeUndefined()
    expect(value).toEqual({ message: 'test' })
  })
})
