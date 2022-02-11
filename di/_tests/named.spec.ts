import { expect } from '@jest/globals'
import { v4 } from 'uuid'
import { Bean } from '../decorators/Bean.js'
import { Configuration } from '../decorators/Configuration.js'
import { Inject } from '../decorators/Inject.js'
import { Injectable } from '../decorators/Injectable.js'
import { Named } from '../decorators/Named.js'
import { Primary } from '../decorators/Primary.js'
import { DI } from '../DI.js'
import { RepeatedBeanNamesConfigurationError } from '../DiError.js'

describe('Named Dependencies', function () {
  const kAck = Symbol('ok')
  const kBye = 'test-named-dependencies-bye'

  @Injectable()
  @Named(kBye)
  class ByeService {
    readonly id: string = v4()

    bye(): string {
      return 'bye-bye'
    }
  }

  @Injectable()
  @Named(kAck)
  class AckService {
    readonly id: string = v4()

    constructor(private readonly byeService: ByeService) {}

    ok(): string {
      return `ok-${this.byeService.bye()}`
    }
  }

  class Msg {
    constructor(readonly type: string) {}
  }

  @Injectable()
  class Root {
    readonly id: string = v4()

    constructor(@Inject(kBye) readonly byeService: ByeService, @Inject(kAck) readonly ackService: AckService) {}
  }

  it('should resolve based on dependency qualifier', function () {
    const root = DI.setup().get(Root)

    expect(root.byeService.bye()).toEqual('bye-bye')
    expect(root.ackService.ok()).toEqual('ok-bye-bye')
  })

  it('should resolve same instance when using named and type', function () {
    const di = DI.setup()
    const bye = di.get(ByeService)
    const byeNamed = di.get(kBye)

    expect(bye).toEqual(byeNamed)
  })

  describe('failure scenarios resolving many', function () {
    it('should fail when trying to set multiple raw beans with same name', function () {
      const kTest = Symbol('test')

      expect(() => {
        @Configuration()
        class ManyRawConf {
          @Bean(kTest)
          test1() {
            return 'one'
          }

          @Bean(kTest)
          test2() {
            return 'two'
          }
        }
      }).toThrow(RepeatedBeanNamesConfigurationError)
    })

    it('should fail when trying to repeat a name for the same type', function () {
      const kOne = Symbol('one')

      expect(() => {
        @Configuration()
        class Rep {
          @Bean(Msg)
          @Named(kOne)
          msg1() {
            return new Msg('one_1')
          }

          @Bean(Msg)
          @Named(kOne)
          msg1_1() {
            return new Msg('one_1_1')
          }
        }
      }).toThrow()
    })
  })

  describe('when configuration provides many components of same type with different names', function () {
    const kTwo = Symbol('two')
    const kAm = Symbol('am')
    const kEu = Symbol('eu')

    @Configuration()
    class Conf {
      @Bean(Msg)
      @Named(kTwo)
      msg2() {
        return new Msg('two_2')
      }

      @Bean(Msg)
      @Named(kAm)
      msg3() {
        return new Msg('am')
      }

      @Bean(Msg)
      @Named(kEu)
      @Primary()
      msg3_1() {
        return new Msg('eu')
      }
    }

    const di = DI.setup()

    describe('and requesting many instances of a type', function () {
      it('should return all registered components ignoring the name when using the class type as the key', function () {
        const multiMsg = di.getMany(Msg)

        expect(multiMsg).toHaveLength(3)
        expect(multiMsg.every(x => x instanceof Msg)).toBeTruthy()
      })

      it('should return an array with a single entry when passing a named key with one entry', function () {
        const twos = di.getMany<Msg>(kTwo)

        expect(twos).toHaveLength(1)
        expect(twos[0]).toBeInstanceOf(Msg)
        expect(twos[0].type).toEqual('two_2')
      })
    })

    it('should return undefined when requesting a instance with the unregistered class type', function () {
      expect(di.get(Msg)).toBeUndefined()
    })

    it('should return an specific instance for each named provided bean', function () {
      const two = di.get<Msg>(kTwo)
      const am = di.get<Msg>(kAm)
      const eu = di.get<Msg>(kEu)

      expect(two.type).toEqual('two_2')
      expect(am.type).toEqual('am')
      expect(eu.type).toEqual('eu')
    })
  })
})
