import { expect } from '@jest/globals'
import { jest } from '@jest/globals'
import { v4 } from 'uuid'
import { ContainerScoped } from '../decorators/ContainerScoped.js'
import { Inject } from '../decorators/Inject.js'
import { Injectable } from '../decorators/Injectable.js'
import { LateBind } from '../decorators/LateBind.js'
import { Named } from '../decorators/Named.js'
import { PreDestroy } from '../decorators/PreDestroy.js'
import { ScopedAs } from '../decorators/ScopedAs.js'
import { DI } from '../DI.js'
import { InvalidBindingError } from '../DiError.js'
import { ProviderContext } from '../internal/Provider.js'
import { Provider } from '../internal/Provider.js'
import { ResolutionContext } from '../ResolutionContext.js'
import { Scopes } from '../Scopes.js'

describe('Manual Binding', function () {
  describe('general bindings', function () {
    const destroySpy = jest.fn()
    const kTest = 'nmTest'

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
    @Named(kTest)
    class Late {
      readonly id: string = v4()

      test() {
        return 'hi'
      }
    }

    @LateBind()
    @Injectable()
    class LateDestroyable {
      @PreDestroy()
      destroy() {
        destroySpy()
      }
    }

    @LateBind()
    @Injectable()
    class StrValue {
      constructor(@Inject('val') readonly val: string) {}
    }

    const sy = Symbol('test')

    @LateBind()
    @Injectable()
    class FromFactory {
      constructor(@Inject(sy) readonly val: string) {}
    }

    beforeEach(() => {
      destroySpy.mockReset()
    })

    it('should bind to class', function () {
      const di = DI.setup()
      const before = di.has(Late)

      di.bind(Late).to(Late).singletonScoped()

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

      di.bind(Abs).to(Impl).singletonScoped()

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

        di.bind(Late).toSelf().transientScoped()

        const r1 = di.get(Late)
        const r2 = di.get(Late)

        expect(r1.id).not.toEqual(r2.id)
      })
    })

    describe('unbinding', function () {
      it('should unbinding registered component when calling .unbind', async function () {
        const di = DI.setup()

        di.bind(Late).toSelf()

        expect(di.has(Late)).toBeTruthy()

        await di.unbind(Late)

        expect(di.has(Late)).toBeFalsy()
      })

      it('should unbind from parent when one is set', async function () {
        const di = DI.setup()
        const child = di.newChild()

        di.bind(Late).toSelf()

        const has = child.has(Late, true)

        await child.unbind(Late)

        expect(has).toBeTruthy()
        expect(child.has(Late, true)).toBeFalsy()
        expect(di.has(Late)).toBeFalsy()
      })

      it('should call pre destroy method when one is set', async function () {
        const di = DI.setup()

        di.bind(LateDestroyable).toSelf()
        di.get(LateDestroyable)

        await di.unbind(LateDestroyable)

        expect(di.has(LateDestroyable)).toBeFalsy()
        expect(destroySpy).toHaveBeenCalledTimes(1)
      })

      it('should call pre destroy only if requested', async function () {
        const di = DI.setup()

        di.bind(LateDestroyable).toSelf()
        di.get(LateDestroyable)

        await di.unbind(LateDestroyable, false)

        expect(di.has(LateDestroyable)).toBeFalsy()
        expect(destroySpy).toHaveBeenCalledTimes(0)
      })
    })

    describe('rebinding', function () {
      it('should rebinding component with a different configuration', async function () {
        const di = DI.setup()

        di.bind(Late).toSelf()

        const dep1 = di.get(Late)

        const bindTo = await di.rebind(Late)
        bindTo.toFactory(() => new Late())

        const dep2 = di.get(Late)

        expect(dep1).not.toEqual(dep2)
      })
    })

    describe('binding several functions to the same qualifier', function () {
      const kQry = Symbol('queries')

      const qry1 = () => 'one'
      const qry2 = () => 'two'
      const qry3 = () => 'three'
      const qry4 = () => 'four'

      it('should resolve all functions', function () {
        const di = DI.setup()

        di.bind(qry1).toValue(qry1).qualifiers(kQry)
        di.bind(qry2).toValue(qry2).qualifiers(kQry)
        di.bind(qry3).toValue(qry3).qualifiers(kQry)

        const queries = di.getMany(kQry)

        expect(queries).toHaveLength(3)
        expect(queries).toContain(qry1)
        expect(queries).toContain(qry2)
        expect(queries).toContain(qry3)
        expect(queries).not.toContain(qry4)
      })
    })

    describe('binding previous bound type to a another token', function () {
      it('should return the previous bound type based on the token', function () {
        const di = DI.setup()
        const first = 'first'
        const other = 'other'

        di.bind(first).toValue('test')
        di.bind(other).toToken(first)

        expect(di.get(other)).toEqual('test')
      })
    })

    describe('binding to a custom provider', function () {
      class Dep {
        value!: string
      }

      class TestProvider extends Provider<Dep> {
        provide(ctx: ProviderContext): Dep {
          const instance = new Dep()

          instance.value = 'test'

          return instance
        }
      }

      it('should use the custom provider to build the instance', function () {
        const di = DI.setup()

        di.bind(Dep).toProvider(new TestProvider())

        const dep = di.get(Dep)

        expect(dep).toBeInstanceOf(Dep)
        expect(dep.value).toEqual('test')
      })
    })

    describe('scoping', function () {
      class TransientDep {
        readonly id: string = v4()
      }

      class CtxDep {
        readonly id: string = v4()
      }

      class ContainerDep {
        readonly id: string = v4()
      }

      describe('when calling .transientScoped()', function () {
        it('should bind component as transient scoped', function () {
          const di = DI.setup()

          di.bind(TransientDep).toSelf().transientScoped()

          const one = di.get(TransientDep)
          const two = di.get(TransientDep)

          expect(one).not.toEqual(two)
        })
      })

      describe('when calling .containerScoped()', function () {
        it('should bind component as container scoped', function () {
          const di = DI.setup()

          di.bind(ContainerDep).toSelf().containerScoped()

          const child = di.newChild()

          expect(di.get(ContainerDep)).not.toEqual(child.get(ContainerDep))
          expect(di.get(ContainerDep)).toEqual(di.get(ContainerDep))
          expect(child.get(ContainerDep)).toEqual(child.get(ContainerDep))
        })
      })

      describe('when calling .resolutionContextScoped()', function () {
        it('should bind component as resolution context scoped', function () {
          const di = DI.setup()
          const ctx = new ResolutionContext()

          di.bind(CtxDep).toSelf().resolutionContextScoped()

          const depOne = di.get(CtxDep, ctx)

          expect(depOne).toBeInstanceOf(CtxDep)
          expect(depOne).toEqual(di.get(CtxDep, ctx))
          expect(depOne).not.toEqual(di.get(CtxDep))
          expect(ctx.resolutions.size).toEqual(1)
        })
      })
    })
  })

  describe('invalid bindings scenarios', function () {
    it('should only accept self binding with class types', function () {
      const di = DI.setup()
      expect(() => di.bind('test').toSelf()).toThrow(InvalidBindingError)
    })
  })
})
