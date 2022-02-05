import { v4 } from 'uuid'
import { Bean } from '../decorators/Bean.js'
import { Configuration } from '../decorators/Configuration.js'
import { Inject } from '../decorators/Inject.js'
import { Injectable } from '../decorators/Injectable.js'
import { Named } from '../decorators/Named.js'
import { DI } from '../DI'

describe('Bean Configuration', function () {
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
      @Named('test')
      service(@Inject('msg') msg: string) {
        spy()
        return new Service(msg)
      }
    }

    it('should resolved named beans', function () {
      const di = DI.setup()
      const msg = 'hello world'

      di.bind('msg').toValue(msg)

      const service = di.get<Service>('test')
      const service2 = di.get<Service>('test')

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
})
