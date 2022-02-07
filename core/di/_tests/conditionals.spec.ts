import { ConditionalOn } from '../ConditionalOn.js'
import { Bean } from '../decorators/Bean.js'
import { Configuration } from '../decorators/Configuration.js'
import { Injectable } from '../decorators/Injectable.js'
import { Optional } from '../decorators/Optional.js'
import { DI } from '../DI.js'

describe('Conditionals', function () {
  describe('using default conditional', function () {
    class NonManaged {}

    @Injectable()
    class Managed {}

    @Injectable()
    @ConditionalOn(ctx => ctx.di.has(NonManaged))
    class NoPass {}

    @Injectable()
    @ConditionalOn(ctx => ctx.di.has(NonManaged), () => process.env.NODE === 'test')
    class NoPassToo {}

    @Injectable()
    @ConditionalOn(ctx => ctx.di.has(Managed))
    @ConditionalOn(() => true)
    class Pass {}

    @Injectable()
    class RefPassed {
      constructor(readonly pass: Pass) {}
    }

    @Injectable()
    class RefNotPassed {
      constructor(readonly noPass: NoPass) {}
    }

    @Injectable()
    class RefNotPassedOptional {
      constructor(@Optional() readonly noPass?: NoPass) {}
    }

    it('should load component only when it pass on all provided conditionals', function () {
      const di = DI.setup()
      const refPassed = di.get(RefPassed)
      const opt = di.get(RefNotPassedOptional)

      expect(refPassed).toBeInstanceOf(RefPassed)
      expect(refPassed.pass).toBeInstanceOf(Pass)
      expect(opt).toBeInstanceOf(RefNotPassedOptional)
      expect(opt.noPass).toBeNull()
      expect(di.has(Pass)).toBeTruthy()
      expect(di.has(NoPass)).toBeFalsy()
      expect(di.has(NoPassToo)).toBeFalsy()
      expect(() => di.getRequired(RefNotPassed)).toThrow()
    })
  })

  describe('using on configuration class', function () {
    describe('and using the decorator on class level', function () {
      const spy1 = jest.fn()
      const spy2 = jest.fn()

      @Configuration()
      @ConditionalOn(() => {
        spy1()
        return false
      })
      class NoConf {
        @Bean('txt')
        @ConditionalOn(() => {
          spy1()
          return true
        })
        txt() {
          return 'txt'
        }

        @Bean('val')
        val() {
          return 'val'
        }
      }

      @Configuration()
      @ConditionalOn(() => {
        spy2()
        return true
      })
      class Conf {
        @Bean('json')
        @ConditionalOn(() => {
          spy2()
          return true
        })
        @ConditionalOn(() => {
          spy2()
          return true
        })
        json() {
          return 'json'
        }

        @Bean('xml')
        @ConditionalOn(() => {
          spy2()
          return false
        })
        @ConditionalOn(() => {
          spy2()
          return true
        })
        xml() {
          return 'xml'
        }
      }

      it('should merge the conditionals from class and method level', function () {
        const di = DI.setup()

        expect(di.has(NoConf)).toBeFalsy()
        expect(di.has('txt')).toBeFalsy()
        expect(di.has('val')).toBeFalsy()
        expect(spy1).toHaveBeenCalledTimes(2)

        expect(di.has(Conf)).toBeTruthy()
        expect(di.has('json')).toBeTruthy()
        expect(di.has('xml')).toBeFalsy()
        expect(spy2).toHaveBeenCalledTimes(4)
      })
    })
  })
})
