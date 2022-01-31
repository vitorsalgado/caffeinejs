import { DI } from '../DI.js'
import { CircularReferenceError } from '../errors.js'
import { Bar } from './circular/Bar.js'
import { Foo } from './circular/Foo.js'
import { FooFail } from './circular/FooFail.js'

describe('DI - Circular References', function () {
  describe('dependencies with deferred constructor', function () {
    it('should resolve dependencies', function () {
      const foo = DI.setup().resolve(Foo)
      const bar = DI.setup().resolve(Bar)

      expect(foo.test()).toEqual('foo-bar')
      expect(bar.test()).toEqual('bar-foo')
    })
  })

  describe('circular references wrongly configured', function () {
    it('should throw error explaining the circular reference', function () {
      expect(() => DI.setup().resolve(FooFail)).toThrow(CircularReferenceError)
    })
  })
})
