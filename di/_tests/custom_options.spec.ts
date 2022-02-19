import { jest } from '@jest/globals'
import { expect } from '@jest/globals'
import { beforeEach } from '@jest/globals'
import { Provider } from '../Provider.js'
import { ResolutionContext } from '../ResolutionContext.js'
import { Injectable } from '../decorators/Injectable.js'
import { ProvidedBy } from '../decorators/ProvidedBy.js'
import { ClassProvider } from '../internal/providers/ClassProvider.js'
import { DI } from '../DI.js'
import { Options } from '../decorators/Options.js'
import { Configuration } from '../decorators/Configuration.js'
import { Bean } from '../decorators/Bean.js'
import { PostProcessor } from '../PostProcessor.js'

describe('Options', function () {
  describe('when providing custom options', function () {
    const spy = jest.fn()
    const options = { message: 'hello world' }

    beforeEach(() => {
      spy.mockReset()
    })

    class SpyProvider<T> implements Provider<T> {
      constructor(private readonly original: Provider<T>) {}

      provide(ctx: ResolutionContext): T {
        spy(ctx.binding.options)
        return this.original.provide(ctx)
      }
    }

    @Injectable()
    @ProvidedBy(new SpyProvider(new ClassProvider(Dep)))
    @Options(options)
    class Dep {}

    class BeanDep {}

    @Configuration()
    class Conf {
      @Bean(BeanDep)
      @Options(options)
      beanDep() {
        return new BeanDep()
      }
    }

    class SpyPp implements PostProcessor {
      afterInit(instance: unknown, ctx: ResolutionContext): unknown {
        if (instance instanceof BeanDep) {
          spy(ctx.binding.options)
        }

        return instance
      }

      beforeInit(instance: unknown, ctx: ResolutionContext): unknown {
        return instance
      }
    }

    it('should be available in the binding inside resolution context', function () {
      const di = DI.setup()
      const dep = di.get(Dep)

      expect(dep).toBeInstanceOf(Dep)
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenCalledWith(options)
    })

    it('should pass options to configuration provided components', function () {
      const pp = new SpyPp()

      DI.addPostProcessor(pp)

      const di = DI.setup()
      const dep = di.get(BeanDep)

      expect(dep).toBeInstanceOf(BeanDep)
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenCalledWith(options)

      DI.removePostProcessor(pp)
    })
  })
})