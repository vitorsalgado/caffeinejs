import { jest } from '@jest/globals'
import { v4 } from 'uuid'
import { Bean } from '../decorators/Bean.js'
import { Configuration } from '../decorators/Configuration.js'
import { Inject } from '../decorators/Inject.js'
import { Injectable } from '../decorators/Injectable.js'
import { Named } from '../decorators/Named.js'
import { Primary } from '../decorators/Primary.js'
import { DI } from '../DI'

describe('Configuration', function () {
  describe('class provider', function () {
    const spy = jest.fn()

    @Injectable()
    class Repo {
      constructor() {
        spy()
      }

      list() {
        return 'listed'
      }
    }

    @Injectable()
    class Listener {
      constructor() {
        spy()
      }

      listen() {
        return 'listened'
      }
    }

    class Service {
      constructor(readonly repo: Repo, readonly listener: Listener) {
        spy()
      }
    }

    @Configuration()
    class ManyBeans {
      constructor(private readonly listener: Listener) {
        spy()
      }

      @Bean(Service)
      service(repo: Repo): Service {
        return new Service(repo, this.listener)
      }
    }

    it('should return instance from method based on class ref', function () {
      const service = DI.setup().get(Service)

      expect(service).toBeDefined()
      expect(service.repo.list()).toEqual('listed')
      expect(service.listener.listen()).toEqual('listened')
      expect(spy).toHaveBeenCalledTimes(4)
    })
  })

  describe('named class provider', function () {
    const spy = jest.fn()
    const kTest = Symbol('test')

    class Service {
      readonly id: string = v4()

      constructor(private readonly msg: string) {}

      txt() {
        return this.msg
      }
    }

    @Configuration()
    class Conf {
      @Bean(Service)
      @Named(kTest)
      service(@Inject('msg') msg: string) {
        spy()
        return new Service(msg)
      }
    }

    it('should resolved named beans', function () {
      const di = DI.setup()
      const msg = 'hello world'

      di.bind('msg').toValue(msg)

      const service = di.get<Service>(kTest)
      const service2 = di.get<Service>(kTest)

      expect(service).toBeInstanceOf(Service)
      expect(service.txt()).toEqual(msg)
      expect(spy).toHaveBeenCalledTimes(1)
      expect(service).toEqual(service2)
    })
  })

  describe('value provider', function () {
    @Configuration()
    class ValueProvider {
      @Bean('txt')
      txt() {
        return 'hello world'
      }
    }

    @Injectable()
    class UsingTxt {
      constructor(@Inject('txt') readonly txt: string) {}
    }

    it('should inject value provided by bean method', function () {
      const di = DI.setup()
      const txt = di.get('txt')
      const usingTxt = di.get(UsingTxt)
      const expected = 'hello world'

      expect(txt).toEqual(expected)
      expect(usingTxt.txt).toEqual(expected)
    })
  })

  describe('configuration class with primary beans', function () {
    const kInterface = Symbol('interface')

    abstract class Abs {
      abstract test(): string
    }

    @Injectable()
    class Abs1 extends Abs {
      test(): string {
        return 'one'
      }
    }

    interface Interface {
      test(): string
    }

    @Injectable()
    @Named(kInterface)
    class A2 implements Interface {
      test(): string {
        return 'a2'
      }
    }

    @Configuration()
    class Conf {
      @Bean(Abs)
      @Primary()
      abs(): Abs {
        return new (class extends Abs {
          test(): string {
            return 'abs-bean'
          }
        })()
      }

      @Bean(kInterface)
      @Primary()
      fromInterface(): Interface {
        return new (class implements Interface {
          test(): string {
            return 'interface-bean'
          }
        })()
      }
    }

    it('should use primary beans from configurations class', function () {
      const di = DI.setup()
      const abs = di.get(Abs)
      const i = di.get<Interface>(kInterface)

      expect(abs.test()).toEqual('abs-bean')
      expect(i.test()).toEqual('interface-bean')
    })
  })
})
