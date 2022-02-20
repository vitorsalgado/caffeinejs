import { expect } from '@jest/globals'
import { jest } from '@jest/globals'
import { v4 } from 'uuid'
import { Inject } from '../decorators/Inject.js'
import { Injectable } from '../decorators/Injectable.js'
import { PostConstruct } from '../decorators/PostConstruct.js'
import { PreDestroy } from '../decorators/PreDestroy.js'
import { Scoped } from '../decorators/Scoped.js'
import { DI } from '../DI.js'
import { Lifecycle } from '../Lifecycle.js'

describe('Hooks', function () {
  describe('Pre Destroy', function () {
    const destroySpy = jest.fn()
    const destroyAsyncSpy = jest.fn()
    const destroyContainerScopedSpy = jest.fn()

    @Injectable()
    class Dep {
      @PreDestroy()
      destroy() {
        destroySpy()
      }
    }

    @Injectable()
    @Scoped(Lifecycle.CONTAINER)
    class ContainerDep {
      @PreDestroy()
      destroy() {
        destroyContainerScopedSpy()
      }
    }

    @Injectable()
    class AsyncDep {
      @PreDestroy()
      destroy(): Promise<void> {
        return new Promise(resolve =>
          setTimeout(() => {
            destroyAsyncSpy()
            return resolve()
          }, 100),
        )
      }
    }

    it('should call method marked as on destroy when instance is a singleton', async function () {
      const di = DI.setup()
      di.get(Dep)

      await di.dispose()

      expect(destroySpy).toHaveBeenCalledTimes(1)
    })

    it('should call method marked as on destroy when instance is container scoped', async function () {
      const di = DI.setup()
      di.get(ContainerDep)

      await di.dispose()

      expect(destroyContainerScopedSpy).toHaveBeenCalledTimes(1)
    })

    it('should accept async destroy method', async function () {
      const di = DI.setup()
      di.get(AsyncDep)

      await di.dispose()

      expect(destroyAsyncSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('Post Construct', function () {
    const stack: string[] = []
    const spy = jest.fn()

    @Injectable()
    class Dep {}

    @Injectable()
    class Prop {}

    @Injectable()
    class Svc {}

    @Injectable()
    class Component {
      id: string = v4()

      @Inject()
      prop!: Prop
      svc!: Svc

      constructor(readonly dep: Dep) {
        stack.push('ctor')
        expect(this.dep).toBeDefined()
        expect(this.prop).toBeUndefined()
        expect(this.svc).toBeUndefined()
      }

      @PostConstruct()
      init() {
        spy()
        stack.push('init')
        expect(this.dep).toBeDefined()
        expect(this.svc).toBeDefined()
        expect(this.prop).toBeDefined()
      }

      @Inject()
      setSvc(svc: Svc) {
        this.svc = svc
        stack.push('method')
      }
    }

    it('should execute after property, method and any other post providers', function () {
      const di = DI.setup()

      di.get(Component)
      di.get(Component)

      expect(spy).toHaveBeenCalledTimes(1)
      expect(stack).toEqual(['ctor', 'method', 'init'])
    })
  })
})
