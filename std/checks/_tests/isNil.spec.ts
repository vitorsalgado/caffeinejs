import { isNil } from '../isNil.js'

describe('isNil', function () {
  it('should return true when value is not null or undefined', function () {
    const str = 'test'
    const bool = true
    const num = 10
    const obj = {}
    const arr: unknown = []
    const undef = undefined
    const nil = null

    expect(isNil(str)).toBeFalsy()
    expect(isNil(bool)).toBeFalsy()
    expect(isNil(num)).toBeFalsy()
    expect(isNil(obj)).toBeFalsy()
    expect(isNil(arr)).toBeFalsy()
    expect(isNil(undef)).toBeTruthy()
    expect(isNil(nil)).toBeTruthy()
  })
})
