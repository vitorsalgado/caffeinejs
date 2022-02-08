import { Bean } from '../decorators/Bean.js'
import { Configuration } from '../decorators/Configuration.js'
import { Injectable } from '../decorators/Injectable.js'
import { Namespace } from '../decorators/Namespace.js'
import { DI } from '../DI.js'
import { NoResolutionForTokenError } from '../DiError.js'

describe('Namespace', function () {
  @Injectable()
  class NsNone {}

  @Injectable()
  @Namespace('ns1')
  class Ns1 {}

  @Injectable()
  @Namespace('ns2')
  class Ns2 {}

  @Injectable()
  @Namespace('ns2')
  class NsDifferentRef {
    constructor(readonly ns1: Ns1) {}
  }

  @Injectable()
  @Namespace('ns2')
  class NsSameRef {
    constructor(readonly ns2: Ns2) {}
  }

  class NsBean {}

  @Configuration({ namespace: 'ns2' })
  class Conf {
    @Bean('dep')
    dep() {
      return 'dep'
    }

    @Bean('diffRef')
    diffRef(ns1: Ns1) {
      return ns1
    }

    @Bean(NsBean)
    sameRef() {
      return new NsBean()
    }
  }

  describe('when namespace is set', function () {
    const di = DI.setup('ns2')

    it('should return components according to its namespace', function () {
      expect(di.get(NsNone)).toBeUndefined()
      expect(di.get(Ns1)).toBeUndefined()
      expect(di.get(Ns2)).toBeInstanceOf(Ns2)
      expect(di.get(NsSameRef)).toBeInstanceOf(NsSameRef)
      expect(di.get(NsSameRef).ns2).toBeInstanceOf(Ns2)
    })

    it('should fail when a component from one namespace has a reference for component from another', function () {
      expect(() => di.get(NsDifferentRef)).toThrow(NoResolutionForTokenError)
    })
  })

  describe('when namespace is not set', function () {
    const di = DI.setup()

    it('should only return components without namespace', function () {
      expect(di.get(NsNone)).toBeInstanceOf(NsNone)
      expect(di.get(Ns1)).toBeUndefined()
      expect(di.get(Ns2)).toBeUndefined()
      expect(di.get(NsDifferentRef)).toBeUndefined()
    })
  })

  describe('using namespaces in configuration providers', function () {
    describe('when namespace is set', function () {
      const di = DI.setup('ns2')

      it('should return components according to its namespace', function () {
        expect(di.get('dep')).toEqual('dep')
        expect(di.get('ns1')).toBeUndefined()
        expect(di.get(Ns1)).toBeUndefined()
        expect(di.get(NsBean)).toBeInstanceOf(NsBean)
      })

      it('should fail when a component from one namespace has a reference for component from another', function () {
        expect(() => di.get('diffRef')).toThrow(NoResolutionForTokenError)
      })
    })
  })
})
