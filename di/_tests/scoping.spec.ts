import { jest } from '@jest/globals'
import { v4 } from 'uuid'
import { DecoratedInjectables } from '../DecoratedInjectables.js'
import { Injectable } from '../decorators/Injectable.js'
import { ScopedAs } from '../decorators/ScopedAs.js'
import { DI } from '../DI.js'
import { ScopeAlreadyRegisteredError } from '../DiError.js'
import { ScopeNotRegisteredError } from '../DiError.js'
import { Provider } from '../internal/Provider.js'
import { Scope } from '../Scope.js'
import { Scopes } from '../Scopes.js'

describe('Scoping', function () {
  const id = Symbol.for('custom')
  const spy = jest.fn()

  class CustomScope<T> extends Scope<T> {
    readonly id: string = v4()

    wrap(unscoped: Provider<T>): Provider<T> {
      spy()
      return unscoped
    }
  }

  @Injectable()
  @ScopedAs(id)
  class Dep {
    readonly id: string = v4()
  }

  it('should fail when using an non-registered scope', function () {
    @Injectable()
    @ScopedAs('none')
    class NonexistentScope {}

    try {
      DI.setup()
    } catch (e) {
      expect(e).toBeInstanceOf(ScopeNotRegisteredError)
      DI.unbindScope('none')
      DecoratedInjectables.instance().delete(NonexistentScope)
      return
    }

    fail('should not reach here!')
  })

  it('should use scope specified with decorator when it is registered', function () {
    const scope = new CustomScope()

    DI.bindScope(id, scope)

    const di = DI.setup()
    const scoped1 = di.get(Dep)
    const scoped2 = di.get(Dep)

    expect(scoped1).toBeInstanceOf(Dep)
    expect(scoped2).toBeInstanceOf(Dep)
    expect(scoped1).not.toEqual(scoped2)
    expect(scope).toEqual(di.getScope(id))
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('should fail when registering a scope with an existing identifier', function () {
    expect(() =>
      DI.bindScope(
        Scopes.SINGLETON,
        new (class extends Scope {
          wrap(unscoped: Provider): Provider {
            return unscoped
          }
        })()
      )
    ).toThrow(ScopeAlreadyRegisteredError)
  })
})
