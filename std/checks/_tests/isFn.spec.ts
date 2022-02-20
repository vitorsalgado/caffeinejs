import { isFn } from '../isFn.js'

describe('isFn', function () {
  it('should return true when value is typeof function', function () {
    expect(isFn(null)).toBeFalsy()
    expect(isFn(undefined)).toBeFalsy()
    expect(isFn(true)).toBeFalsy()
    expect(isFn(20)).toBeFalsy()
    expect(isFn('test')).toBeFalsy()
    expect(isFn(() => '')).toBeTruthy()
    expect(isFn(function () {})).toBeTruthy()
  })
})
