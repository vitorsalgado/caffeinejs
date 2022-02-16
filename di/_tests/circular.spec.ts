import { expect } from '@jest/globals'
import { newBinding } from '../Binding.js'
import { DI } from '../DI.js'
import { CircularReferenceError } from '../DiError.js'
import { TokenProvider } from '../internal/TokenProvider.js'
import { Bar } from './_fixtures/circular/Bar.js'
import { BarFail } from './_fixtures/circular/BarFail.js'
import { Foo } from './_fixtures/circular/Foo.js'
import { FooFail } from './_fixtures/circular/FooFail.js'

describe('Circular References', function () {
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

      expect(foo.uuid).toEqual(foo2.uuid)
      expect(bar.uuid).not.toEqual(bar2.uuid)
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

      di.configureBinding('foo', newBinding({ rawProvider: new TokenProvider('foo') }))

      expect(() => di.configureBinding('foo', newBinding({ rawProvider: new TokenProvider('foo') }))).toThrow()
    })
  })
})
