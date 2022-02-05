import { Injectable } from '../decorators/Injectable.js'
import { OnDestroy } from '../decorators/OnDestroy.js'
import { Scoped } from '../decorators/Scoped.js'
import { DI } from '../DI.js'
import { Lifecycle } from '../Lifecycle.js'

describe('DI - Hooks', function () {
  describe('onDestroy', function () {
    const destroySpy = jest.fn()
    const destroyAsyncSpy = jest.fn()
    const destroyContainerScopedSpy = jest.fn()

    @Injectable()
    class Dep {
      @OnDestroy()
      destroy() {
        destroySpy()
      }
    }

    @Injectable()
    @Scoped(Lifecycle.CONTAINER)
    class ContainerDep {
      @OnDestroy()
      destroy() {
        destroyContainerScopedSpy()
      }
    }

    @Injectable()
    class AsyncDep {
      @OnDestroy()
      destroy(): Promise<void> {
        return new Promise(resolve =>
          setTimeout(() => {
            destroyAsyncSpy()
            return resolve()
          }, 100)
        )
      }
    }

    it('should call method marked as on destroy when instance is a singleton', async function () {
      const di = DI.setup()
      di.get(Dep)

      await di.finalize()

      expect(destroySpy).toHaveBeenCalledTimes(1)
    })

    it('should call method marked as on destroy when instance is container scoped', async function () {
      const di = DI.setup()
      di.get(ContainerDep)

      await di.finalize()

      expect(destroyContainerScopedSpy).toHaveBeenCalledTimes(1)
    })

    it('should accept async destroy method', async function () {
      const di = DI.setup()
      di.get(AsyncDep)

      await di.finalize()

      expect(destroyAsyncSpy).toHaveBeenCalledTimes(1)
    })
  })
})