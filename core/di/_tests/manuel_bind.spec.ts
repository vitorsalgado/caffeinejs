import { v4 } from 'uuid'
import { Inject } from '../decorators/Inject.js'
import { Injectable } from '../decorators/Injectable.js'
import { LateBind } from '../decorators/LateBind.js'
import { Named } from '../decorators/Named.js'
import { DI } from '../DI.js'

describe('Manual Binding', function () {
  abstract class Abs {
    abstract msg(): string
  }

  @LateBind()
  @Injectable()
  class Impl extends Abs {
    msg(): string {
      return 'impl'
    }
  }

  @LateBind()
  @Injectable()
  @Named('test')
  class Late {
    readonly id: string = v4()

    test() {
      return 'hi'
    }
  }

  @LateBind()
  @Injectable()
  class StrValue {
    constructor(@Inject('val') readonly val: string) {}
  }

  const sy = Symbol.for('test')

  @LateBind()
  @Injectable()
  class FromFactory {
    constructor(@Inject(sy) readonly val: string) {}
  }

  it('should bind to class', function () {
    const di = DI.setup()
    const before = di.has(Late)

    di.bind(Late).to(Late).singleton()

    const after = di.has(Late)
    const late = di.get(Late)

    expect(before).toBeFalsy()
    expect(after).toBeTruthy()
    expect(late).toBeDefined()
  })

  it('should bind to class by name', function () {
    const di = DI.setup()

    di.bind('test').to(Late)

    const r = di.get<Late>('test')

    expect(r).toBeInstanceOf(Late)
    expect(r.test()).toEqual('hi')
  })

  it('should bind abstract class to concrete implementation', function () {
    const di = DI.setup()

    di.bind(Abs).to(Impl).singleton()

    const impl = di.get(Abs)

    expect(impl.msg()).toEqual('impl')
  })

  it('should bind value', function () {
    const di = DI.setup()

    di.bind('val').toValue('test')
    di.bind(StrValue).toSelf()

    const r = di.get(StrValue)
    const v = di.get('val')

    expect(r.val).toEqual('test')
    expect(v).toEqual('test')
  })

  it('should bind factory', function () {
    const di = DI.setup()

    di.bind('val').toValue('test')
    di.bind(sy).toFactory(({ di }) => `factory-${di.get('val')}`)
    di.bind(FromFactory).toSelf()

    const r = di.get(FromFactory)
    const v = di.get(sy)

    expect(r.val).toEqual('factory-test')
    expect(v).toEqual('factory-test')
  })

  describe('with options', function () {
    it('should bind dependency as transient when using .transient()', function () {
      const di = DI.setup()

      di.bind(Late).toSelf().transient()

      const r1 = di.get(Late)
      const r2 = di.get(Late)

      expect(r1.id).not.toEqual(r2.id)
    })
  })

  describe('unbinding', function () {
    it('should unbinding registered component when calling .unbind', function () {
      const di = DI.setup()

      di.bind(Late).toSelf()

      expect(di.has(Late)).toBeTruthy()

      di.unbind(Late)

      expect(di.has(Late)).toBeFalsy()
    })
  })

  describe('rebinding', function () {
    it('should rebinding component with a different configuration', function () {
      const di = DI.setup()

      di.bind(Late).toSelf()

      const dep1 = di.get(Late)

      di.rebind(Late).toFactory(ctx => new Late())

      const dep2 = di.get(Late)

      expect(dep1).not.toEqual(dep2)
    })
  })
})
