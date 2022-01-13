import { sum } from './component.js'

describe('Test', function () {
  it('should sum two values', function () {
    expect(sum(2, 2)).toEqual(4)
  })
})
