import { v4 } from 'uuid'
import { DI } from '../DI.js'
import { Inject } from '../decorators/Inject.js'
import { LateInjectable } from '../decorators/LateInjectable.js'
import { Named } from '../decorators/Named.js'

describe('DI - Manual Binding', function () {
  abstract class Abs {
    abstract msg(): string
  }

  @LateInjectable()
  class Impl extends Abs {
    msg(): string {
      return 'impl'
    }
  }

  @LateInjectable()
  @Named('test')
  class Late {
    readonly id: string = v4()

    test() {
      return 'hi'
    }
  }

  @LateInjectable()
  class StrValue {
    constructor(@Inject('val') readonly val: string) {}
  }

  const sy = Symbol.for('test')

  @LateInjectable()
  class FromFactory {
    constructor(@Inject(sy) readonly val: string) {}
  }

  it('should bind to class', function () {
    const di = DI.setup()
    const before = di.has(Late)

    di.bind(Late).to(Late).singleton()

    const after = di.has(Late)
    const late = di.resolve(Late)

    expect(before).toBeFalsy()
    expect(after).toBeTruthy()
    expect(late).toBeDefined()
  })

  it('should bind to class by name', function () {
    const di = DI.setup()

    di.bind('test').to(Late)

    const r = di.resolve<Late>('test')

    expect(r).toBeInstanceOf(Late)
    expect(r.test()).toEqual('hi')
  })

  it('should bind abstract class to concrete implementation', function () {
    const di = DI.setup()

    di.bind(Abs).to(Impl).singleton()

    const impl = di.resolve(Abs)

    expect(impl.msg()).toEqual('impl')
  })

  it('should bind value', function () {
    const di = DI.setup()

    di.bind('val').toValue('test')
    di.bind(StrValue).toSelf()

    const r = di.resolve(StrValue)
    const v = di.resolve('val')

    expect(r.val).toEqual('test')
    expect(v).toEqual('test')
  })

  it('should bind factory', function () {
    const di = DI.setup()

    di.bind('val').toValue('test')
    di.bind(sy).toFactory(({ di }) => `factory-${di.resolve('val')}`)
    di.bind(FromFactory).toSelf()

    const r = di.resolve(FromFactory)
    const v = di.resolve(sy)

    expect(r.val).toEqual('factory-test')
    expect(v).toEqual('factory-test')
  })

  describe('with options', function () {
    it('should bind dependency as transient when using .transient()', function () {
      const di = DI.setup()

      di.bind(Late).toSelf().transient()

      const r1 = di.resolve(Late)
      const r2 = di.resolve(Late)

      expect(r1.id).not.toEqual(r2.id)
    })
  })
})
