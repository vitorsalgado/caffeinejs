import { expect } from '@jest/globals'
import { v4 } from 'uuid'
import { Injectable } from '../decorators/Injectable.js'
import { Scoped } from '../decorators/Scoped.js'
import { DI } from '../DI.js'
import { Lifecycle } from '../Lifecycle.js'
import { ServiceLocator } from '../ServiceLocator.js'
import { SingletonScope } from '../internal/scopes/SingletonScope.js'
import { ContainerScope } from '../internal/scopes/ContainerScope.js'
import { LocalResolutionScope } from '../internal/scopes/LocalResolutionScope.js'
import { TransientScope } from '../internal/scopes/TransientScope.js'
import { RequestScope } from '../internal/scopes/RequestScope.js'
import { RefreshScope } from '../internal/scopes/RefreshScope.js'
import { Scope } from '../Scope.js'
import { Binding } from '../Binding.js'
import { ResolutionContext } from '../ResolutionContext.js'
import { Provider } from '../Provider.js'

describe('Internal Components', function () {
  describe('Service Locator', function () {
    @Injectable()
    @Scoped(Lifecycle.CONTAINER)
    class Svc {
      readonly id: string = v4()

      test() {
        return 'hello world'
      }
    }

    it('should create a singleton service locator', function () {
      const di = DI.setup()
      const sl1 = di.get(ServiceLocator)
      const svc11 = sl1.get(Svc)
      const svc12 = sl1.get(Svc)
      const svc13 = di.get(Svc)

      const child = di.newChild()
      const sl2 = child.get(ServiceLocator)
      const svc21 = sl2.get(Svc)
      const svc22 = sl2.get(Svc)
      const svc23 = child.get(Svc)

      expect(sl1.has(Svc)).toBeTruthy()
      expect(sl2.has(Svc)).toBeTruthy()

      expect(sl1).toBeInstanceOf(ServiceLocator)
      expect(sl2).toBeInstanceOf(ServiceLocator)

      expect(svc11).toBeInstanceOf(Svc)
      expect(svc12).toBeInstanceOf(Svc)
      expect(svc13).toBeInstanceOf(Svc)
      expect(svc11).toEqual(svc12)
      expect(svc12).toEqual(svc13)

      expect(svc21).toBeInstanceOf(Svc)
      expect(svc22).toBeInstanceOf(Svc)
      expect(svc23).toBeInstanceOf(Svc)
      expect(svc21).toEqual(svc22)
      expect(svc22).toEqual(svc23)

      expect(svc11).not.toEqual(svc21)
      expect(sl1).not.toEqual(sl2)

      expect(svc11.test()).toEqual('hello world')
      expect(svc21.test()).toEqual('hello world')
    })

    it('should expose getMany() from container', function () {
      const di = DI.setup()
      const serviceLocator = di.get(ServiceLocator)
      const many = serviceLocator.getMany(Svc)

      expect(many).toHaveLength(1)
      expect(many[0]).toBeInstanceOf(Svc)
    })
  })

  describe('Scopes', function () {
    const kId = Symbol('custom_scope_id')

    class CustomScope implements Scope {
      cachedInstance<T>(binding: Binding): T | undefined {
        return undefined
      }

      get<T>(ctx: ResolutionContext, provider: Provider<T>): T {
        return provider.provide(ctx)
      }

      remove(binding: Binding): void {}
    }

    it('should register add registered scopes in the container', function () {
      DI.bindScope(kId, new CustomScope())

      const di = DI.setup()

      expect(di.has(SingletonScope)).toBeTruthy()
      expect(di.has(ContainerScope)).toBeTruthy()
      expect(di.has(LocalResolutionScope)).toBeTruthy()
      expect(di.has(TransientScope)).toBeTruthy()
      expect(di.has(RequestScope)).toBeTruthy()
      expect(di.has(RefreshScope)).toBeTruthy()

      expect(di.has(CustomScope)).toBeTruthy()
      expect(di.has(kId)).toBeTruthy()
      expect(di.get(kId)).toBeInstanceOf(CustomScope)
    })
  })
})
