import { expect } from '@jest/globals'
import { Binding } from '../Binding.js'
import { Injectable } from '../decorators/Injectable.js'
import { Named } from '../decorators/Named.js'
import { Optional } from '../decorators/Optional.js'
import { DI } from '../DI.js'
import { InternalMetadataReader } from '../internal/MetadataReader.js'
import { MetadataReader } from '../internal/MetadataReader.js'
import { Token } from '../Token.js'

describe('DI', function () {
  const kTestName = Symbol('test-name')

  @Injectable()
  class Test {}

  @Injectable()
  class Dep {}

  class Opt {}

  @Injectable()
  @Named(kTestName)
  class NamedTest {
    constructor(readonly dep: Dep, @Optional() readonly opt?: Opt) {}
  }

  it('should print the type name when calling toString()', function () {
    const di = DI.setup()
    di.bind('tk100').toValue('test')
    di.bind('tk200').toValue('test')

    const str = di.toString()
    const protoStr = Object.prototype.toString.call(di)

    expect(str).toContain('Test')
    expect(str).toContain('NamedTest')
    expect(str).toContain(kTestName.description)
    expect(str).toContain('tk100')
    expect(str).toContain('tk200')
    expect(protoStr).toEqual('[object DI]')
  })

  it('should return the number of registered components when calling size()', function () {
    const di = DI.setup()

    expect(di.size()).toEqual(3 + 1) // <User Registered> + <Internal Components>
  })

  it('should allow to iterate all binding entries', function () {
    const di = DI.setup()
    const entries = new Map(di.entries())

    for (const [token, binding] of di.entries()) {
      expect(token).toBeDefined()
      expect(binding).toBeDefined()
    }

    expect(entries.has(NamedTest)).toBeTruthy()
    expect(entries.get(NamedTest)?.names).toContain(kTestName)
    expect(entries.has(Test)).toBeTruthy()
    expect(entries.size).toEqual(di.size())
  })

  it('should allow iterate all binding aliases', function () {
    const di = DI.setup()
    const aliases = new Map(di.aliases())
    const entries = new Map(di.entries())
    const named = entries.get(NamedTest)

    for (const [token, bindings] of di.aliases()) {
      expect(token).toBeDefined()
      expect(bindings).toBeInstanceOf(Array)
    }

    expect(aliases.has(kTestName)).toBeTruthy()
    expect(aliases.get(kTestName)?.[0]).toEqual(named)
  })

  it('should allow iteration direct on DI instance', function () {
    const di = DI.setup()
    const entries = new Map(di)

    for (const [token, binding] of di) {
      expect(token).toBeDefined()
      expect(binding).toBeDefined()
    }

    expect(entries.has(NamedTest)).toBeTruthy()
    expect(entries.get(NamedTest)?.names).toContain(kTestName)
    expect(entries.has(Test)).toBeTruthy()
    expect(entries.size).toEqual(di.size())
  })

  describe('when using a custom metadata reader', function () {
    it('should not allow invalid metadata reader instances', function () {
      expect(() => DI.changeMetadataReader('wrong' as any)).toThrow()
    })

    it('should allow set an alternative metadata reader', function () {
      const original = DI.MetadataReader

      class Custom implements MetadataReader {
        read(token: Token): Partial<Binding> {
          return original.read(token)
        }
      }

      try {
        DI.changeMetadataReader(new Custom())
      } finally {
        expect(DI.MetadataReader).toBeInstanceOf(Custom)
        DI.MetadataReader = original
        expect(DI.MetadataReader).toBeInstanceOf(InternalMetadataReader)
      }
    })
  })
})
