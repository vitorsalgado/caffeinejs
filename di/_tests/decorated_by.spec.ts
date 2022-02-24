import { jest } from '@jest/globals'
import { describe } from '@jest/globals'
import { Injectable } from '../decorators/Injectable.js'
import { DecoratedBy } from '../decorators/DecoratedBy.js'
import { DI } from '../DI.js'
import { Decoratee } from '../decorators/Decoratee.js'
import { Configuration } from '../decorators/Configuration.js'
import { Bean } from '../decorators/Bean.js'
import { NoResolutionForTokenError } from '../internal/errors.js'
import { InvalidBindingError } from '../internal/errors.js'
import { Primary } from '../decorators/Primary.js'
import { ConditionalOn } from '../decorators/ConditionalOn.js'

describe('Decorators', function () {
  describe('decorating a class', function () {
    const kService = Symbol('service')
    const spy = jest.fn()

    interface IService {
      save(): string
    }

    @Injectable()
    class Dep {
      id = 'custom'
    }

    @Injectable()
    class DecoratedService implements IService {
      constructor(@Decoratee() readonly decorated: IService, readonly dep: Dep) {}

      save(): string {
        spy()
        return this.decorated.save() + ' ' + this.dep.id
      }
    }

    @Injectable(kService)
    @DecoratedBy(DecoratedService)
    class Service implements IService {
      save() {
        return 'saved'
      }
    }

    it('should decorate the class with the component specified via @decorator', function () {
      const di = DI.setup()
      const service = di.get(Service)

      const result = service.save()

      expect(spy).toHaveBeenCalledTimes(1)
      expect(result).toEqual('saved custom')
    })
  })

  describe('decorating configuration beans', function () {
    const kService = Symbol('service')
    const spy = jest.fn()

    interface IService {
      save(): string
    }

    @Injectable()
    class Dep {
      id = 'custom'
    }

    @Injectable()
    class DecoratedService implements IService {
      constructor(@Decoratee() readonly decorated: IService, readonly dep: Dep) {}

      save(): string {
        spy()
        return this.decorated.save() + ' ' + this.dep.id
      }
    }

    class Service implements IService {
      save() {
        return 'saved'
      }
    }

    @Configuration()
    class Conf {
      @Bean(kService)
      @DecoratedBy(DecoratedService)
      service = () => new Service()
    }

    it('should decorate the bean with the component specified via @decorator on method level', function () {
      const di = DI.setup()
      const service = di.get<IService>(kService)

      const result = service.save()

      expect(spy).toHaveBeenCalledTimes(1)
      expect(result).toEqual('saved custom')
    })
  })

  describe('when pointing to multiple decorators with one as primary', function () {
    const kDecorator = Symbol('test')
    const spy = jest.fn()

    interface IService {
      save(): string
    }

    @Injectable()
    class Dep {}

    @Injectable(kDecorator)
    class Dec1 implements IService {
      constructor(@Decoratee() readonly decorated: IService, readonly dep: Dep) {}

      save(): string {
        spy()
        return this.decorated.save()
      }
    }

    @Injectable(kDecorator)
    @Primary()
    class Dec2 implements IService {
      constructor(@Decoratee() readonly decorated: IService, readonly dep: Dep) {}

      save(): string {
        spy()
        return this.decorated.save() + ' by ' + 'dec2'
      }
    }

    @Injectable()
    @DecoratedBy(kDecorator)
    class Service implements IService {
      save() {
        return 'saved'
      }
    }

    it('should decorate class with the primary decorator', function () {
      const di = DI.setup()
      const service = di.get(Service)

      const result = service.save()

      expect(spy).toHaveBeenCalledTimes(1)
      expect(result).toEqual('saved by dec2')
    })
  })

  describe('when pointing to multiple decorators with conditionals', function () {
    const kDecorator = Symbol('test')
    const spy = jest.fn()

    interface IService {
      save(): string
    }

    @Injectable()
    class Dep {}

    @Injectable(kDecorator)
    @ConditionalOn(() => true)
    class Dec1 implements IService {
      constructor(@Decoratee() readonly decorated: IService, readonly dep: Dep) {}

      save(): string {
        spy()
        return this.decorated.save() + ' by ' + 'dec1'
      }
    }

    @Injectable(kDecorator)
    @ConditionalOn(() => false)
    class Dec2 implements IService {
      constructor(@Decoratee() readonly decorated: IService, readonly dep: Dep) {}

      save(): string {
        spy()
        return this.decorated.save()
      }
    }

    @Injectable()
    @DecoratedBy(kDecorator)
    class Service implements IService {
      save() {
        return 'saved'
      }
    }

    it('should decorate class with the decorator that is left', function () {
      const di = DI.setup()
      const service = di.get(Service)

      const result = service.save()

      expect(spy).toHaveBeenCalledTimes(1)
      expect(result).toEqual('saved by dec1')
    })
  })

  describe('when decorator is not registered', function () {
    const kService = Symbol('test')

    interface IService {
      save(): string
    }

    @Injectable()
    class Dep {}

    class DecoratedService implements IService {
      constructor(@Decoratee() readonly decorated: IService, readonly dep: Dep) {}

      save(): string {
        return this.decorated.save()
      }
    }

    @Injectable(kService)
    @DecoratedBy(DecoratedService)
    class Service implements IService {
      save() {
        return 'saved'
      }
    }

    it('should fail with a resolution error', function () {
      expect(() => DI.setup().get(Service)).toThrow(NoResolutionForTokenError)
    })
  })

  describe('when there are more than one decorator without a primary', function () {
    const kDecorator = Symbol('test')

    class IService {
      save() {
        return ''
      }
    }

    @Injectable()
    class Dep {}

    @Injectable(kDecorator)
    class Dec1 implements IService {
      constructor(@Decoratee() readonly decorated: IService, readonly dep: Dep) {}

      save(): string {
        return this.decorated.save()
      }
    }

    @Injectable(kDecorator)
    class Dec2 implements IService {
      constructor(@Decoratee() readonly decorated: IService, readonly dep: Dep) {}

      save(): string {
        return this.decorated.save()
      }
    }

    @Injectable()
    @DecoratedBy(kDecorator)
    class Service implements IService {
      save() {
        return 'saved'
      }
    }

    it('should fail', function () {
      expect(() => DI.setup().get(Service)).toThrow()
    })
  })

  it('should fail when there is no decoratee constructor parameter', function () {
    expect(() => {
      class IService {
        save() {
          return ''
        }
      }

      @Injectable()
      class Dec implements IService {
        constructor(readonly decorated: IService) {}

        save(): string {
          return this.decorated.save()
        }
      }

      @Injectable()
      @DecoratedBy(Dec)
      class Service implements IService {
        save() {
          return 'saved'
        }
      }

      const di = DI.setup()

      di.get(Service)
    }).toThrow(InvalidBindingError)
  })

  it('should fail when there is more than 1 decoratee constructor parameter', function () {
    expect(() => {
      class IService {
        save() {
          return ''
        }
      }

      @Injectable()
      class Dec implements IService {
        constructor(@Decoratee() readonly decorated: IService, @Decoratee() readonly another: IService) {}

        save(): string {
          return this.decorated.save()
        }
      }

      @Injectable()
      @DecoratedBy(Dec)
      class Service implements IService {
        save() {
          return 'saved'
        }
      }

      const di = DI.setup()

      di.get(Service)
    }).toThrow(InvalidBindingError)
  })
})
