import { expect } from '@jest/globals'
import { afterAll } from '@jest/globals'
import { jest } from '@jest/globals'
import { v4 } from 'uuid'
import { Binding } from '../../../Binding.js'
import { TypeRegistrar } from '../../TypeRegistrar.js'
import { Injectable } from '../../../decorators/Injectable.js'
import { Scoped } from '../../../decorators/Scoped.js'
import { DI } from '../../../DI.js'
import { ScopeAlreadyRegisteredError } from '../../errors.js'
import { ScopeNotRegisteredError } from '../../errors.js'
import { Provider } from '../../../Provider.js'
import { Lifecycle } from '../../../Lifecycle.js'
import { Scope } from '../../../Scope.js'
import { ResolutionContext } from '../../../ResolutionContext.js'

describe('Scoping', function () {
  const kCustomScopeId = Symbol('custom')
  const spy = jest.fn()

  class CustomScope implements Scope {
    readonly id: string = v4()

    get<T>(ctx: ResolutionContext, provider: Provider<T>): T {
      spy()
      return provider.provide(ctx)
    }

    cachedInstance<T>(binding: Binding): T | undefined {
      return undefined
    }

    remove(binding: Binding): void {}
  }

  @Injectable()
  @Scoped(kCustomScopeId)
  class Dep {
    readonly id: string = v4()
  }

  afterAll(() => {
    DI.unbindScope(kCustomScopeId)
    TypeRegistrar.remove(Dep)
  })

  it('should fail when using an non-registered scope', function () {
    @Injectable()
    @Scoped('none')
    class NonexistentScope {}

    try {
      DI.setup()
    } catch (e) {
      expect(e).toBeInstanceOf(ScopeNotRegisteredError)
      expect(() => DI.getScope('none')).toThrow(ScopeNotRegisteredError)
      expect(DI.hasScope('none')).toBeFalsy()
      return
    } finally {
      DI.unbindScope('none')
      TypeRegistrar.remove(NonexistentScope)
    }

    fail('should not reach here!')
  })

  it('should use scope specified with decorator when it is registered', function () {
    const scope = new CustomScope()

    DI.bindScope(kCustomScopeId, scope)

    const di = DI.setup()
    const scoped1 = di.get(Dep)
    const scoped2 = di.get(Dep)

    expect(scoped1).toBeInstanceOf(Dep)
    expect(scoped2).toBeInstanceOf(Dep)
    expect(scoped1).not.toEqual(scoped2)
    expect(scope).toEqual(DI.getScope(kCustomScopeId))
    expect(spy).toHaveBeenCalledTimes(2)
    expect(DI.getScope(kCustomScopeId)).toBeInstanceOf(CustomScope)
    expect(DI.getScope(kCustomScopeId)).toEqual(scope)
  })

  it('should fail when registering a scope with an existing identifier', function () {
    expect(() =>
      DI.bindScope(
        Lifecycle.SINGLETON,
        new (class implements Scope {
          get<T>(ctx: ResolutionContext, provider: Provider<T>): T {
            return provider.provide(ctx)
          }

          cachedInstance<T>(binding: Binding): T | undefined {
            return undefined
          }

          remove(binding: Binding): void {}
        })(),
      ),
    ).toThrow(ScopeAlreadyRegisteredError)
  })
})
