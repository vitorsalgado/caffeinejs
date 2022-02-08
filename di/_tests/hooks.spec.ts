import { Injectable } from '../decorators/Injectable.js'
import { PreDestroy } from '../decorators/PreDestroy.js'
import { ScopedAs } from '../decorators/ScopedAs.js'
import { DI } from '../DI.js'
import { Scopes } from '../Scopes.js'

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
    @ScopedAs(Scopes.CONTAINER)
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
