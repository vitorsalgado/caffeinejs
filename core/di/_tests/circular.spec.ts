import { Binding } from '../Binding.js'
import { DI } from '../DI.js'
import { CircularReferenceError } from '../errors.js'
import { Bar } from './circular/Bar.js'
import { BarFail } from './circular/BarFail.js'
import { Foo } from './circular/Foo.js'
import { FooFail } from './circular/FooFail.js'

describe('DI - Circular References', function () {
  describe('dependencies with deferred constructor', function () {
    it('should resolve dependencies', function () {
      const di = DI.setup()

      const foo = di.get(Foo)
      const bar = di.get(Bar)
      const foo2 = di.get(Foo)
      const bar2 = di.get(Bar)

      di.get(Foo)
      di.get(Bar)

      expect(foo.test()).toEqual('foo-bar')
      expect(bar.test()).toEqual('bar-foo')

      expect(foo2.test()).toEqual('foo-bar')
      expect(bar2.test()).toEqual('bar-foo')
    })
  })

  describe('circular references wrongly configured', function () {
    it('should throw error explaining the circular reference', function () {
      expect(() => DI.setup().get(FooFail)).toThrow(CircularReferenceError)
      expect(() => DI.setup().get(BarFail)).toThrow(CircularReferenceError)
    })
  })

  describe('attempt to register a injection pointing to itself', function () {
    it('should throw error', function () {
      const di = DI.setup()

      di.registerBinding('foo', Binding.newBinding({ provider: { useToken: 'foo' } }))

      expect(() => di.registerBinding('foo', Binding.newBinding({ provider: { useToken: 'foo' } }))).toThrow()
    })
  })
})
