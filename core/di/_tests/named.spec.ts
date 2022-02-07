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
  const ack = Symbol.for('ok')

  @Injectable()
  @Named('bye')
  class ByeService {
    readonly id: string = v4()

    bye(): string {
      return 'bye-bye'
    }
  }

  @Injectable()
  @Named(ack)
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

    constructor(@Inject('bye') readonly byeService: ByeService, @Inject(ack) readonly ackService: AckService) {}
  }

  it('should resolve based on dependency qualifier', function () {
    const root = DI.setup().get(Root)

    expect(root.byeService.bye()).toEqual('bye-bye')
    expect(root.ackService.ok()).toEqual('ok-bye-bye')
  })

  it('should resolve same instance when using named and type', function () {
    const di = DI.setup()
    const bye = di.get(ByeService)
    const byeNamed = di.get('bye')

    expect(bye).toEqual(byeNamed)
  })

  describe('resolving many', function () {
    @Configuration()
    class Conf {
      @Bean(Msg)
      @Named('two')
      msg2() {
        return new Msg('two_2')
      }

      @Bean(Msg)
      @Named('am')
      msg3() {
        return new Msg('am')
      }

      @Bean(Msg)
      @Named('eu')
      @Primary()
      msg3_1() {
        return new Msg('eu')
      }
    }

    it('should fail when trying to set multiple raw beans with same name', function () {
      expect(() => {
        @Configuration()
        class ManyRawConf {
          @Bean('test')
          test1() {
            return 'one'
          }

          @Bean('test')
          test2() {
            return 'two'
          }
        }
      }).toThrow(RepeatedBeanNamesConfigurationError)
    })

    it('should fail when trying to repeat a name for the same type', function () {
      expect(() => {
        @Configuration()
        class Rep {
          @Bean(Msg)
          @Named('one')
          msg1() {
            return new Msg('one_1')
          }

          @Bean(Msg)
          @Named('one')
          msg1_1() {
            return new Msg('one_1_1')
          }
        }
      }).toThrow()
    })

    it('should ', function () {
      const di = DI.setup()
      const twos = di.getMany('two')
      const two = di.get<Msg>('two')
      const msgs = di.getMany(Msg)
      const am = di.get<Msg>('am')
      const eu = di.get<Msg>('eu')

      expect(twos).toHaveLength(1)
      expect(two.type).toEqual('two_2')
      expect(msgs).toHaveLength(3)
      expect(am.type).toEqual('am')
      expect(eu.type).toEqual('eu')
    })
  })
})
