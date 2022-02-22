import { jest } from '@jest/globals'
import { Maybe } from '../Maybe.js'

describe('Maybe', function () {
  it('should not throw error when using .of() with null value', function () {
    expect(() => Maybe.of(null)).not.toThrow()
  })

  describe('when maybe data is present', function () {
    it('should get the provided data', function () {
      const test = 'test'
      const opt = Maybe.of(test)

      expect(opt.get()).toEqual(test)
      expect(opt.or('def')).toEqual(test)
    })

    it('should inform data is present when it is not null', function () {
      const test = 'test'
      const opt = Maybe.ofNullable(test)

      expect(opt.isPresent()).toBeTruthy()
      expect(opt.isEmpty()).toBeFalsy()
    })

    it('should get a maybe with data from mapper', function () {
      const test = 'test'
      const opt = Maybe.ofNullable(test).map(value => `${value}+01`)

      expect(opt.get()).toEqual('test+01')
      expect(opt.or('def')).not.toEqual('def')
    })

    it('should execute .ifPresent() function only if there is any data available', function () {
      const fnFull = jest.fn()
      const fnEmpty = jest.fn()
      const full = Maybe.of('test')
      const empty = Maybe.empty()

      full.ifPresent(fnFull)
      empty.ifPresent(fnEmpty)

      expect(fnFull).toBeCalledTimes(1)
      expect(fnEmpty).not.toHaveBeenCalled()
    })
  })

  describe('when map with no data present', function () {
    it('should return empty maybe', function () {
      const opt = Maybe.empty().map(value => `${value}+01`)

      expect(opt.isEmpty()).toBeTruthy()
    })

    it('should return empty maybe when calling .empty()', function () {
      expect(Maybe.empty().isEmpty()).toBeTruthy()
    })
  })

  describe('when maybe is empty', function () {
    it('should return default value when calling .orValue()', function () {
      const empty = Maybe.empty()
      const present = Maybe.of('hey')

      expect(empty.or('test')).toEqual('test')
      expect(present.or('other')).toEqual('hey')
    })

    it('should return undefined when calling .orNothing()', function () {
      const empty = Maybe.empty()
      const present = Maybe.of('hey')

      expect(empty.orNothing()).toBeUndefined()
      expect(present.orNothing()).toEqual('hey')
    })
  })
})
