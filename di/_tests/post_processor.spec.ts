import { beforeAll } from '@jest/globals'
import { afterAll } from '@jest/globals'
import { expect } from '@jest/globals'
import { jest } from '@jest/globals'
import { Binding } from '../Binding.js'
import { Injectable } from '../decorators/Injectable.js'
import { ScopedAs } from '../decorators/ScopedAs.js'
import { DI } from '../DI.js'
import { Provider } from '../Provider.js'
import { PostProcessor } from '../PostProcessor.js'
import { Scope } from '../Scope.js'
import { ResolutionContext } from '../ResolutionContext.js'

describe('Post Processors', function () {
  const ppSpy = jest.fn()
  const sSpy = jest.fn()
  const kScope = Symbol('custom_transient')

  class CustomTransient implements Scope {
    get<T>(ctx: ResolutionContext, provider: Provider<T>): T {
      sSpy()
      return provider.provide(ctx)
    }

    cachedInstance<T>(binding: Binding): T | undefined {
      return undefined
    }

    remove(binding: Binding): void {}
  }

  @Injectable()
  @ScopedAs(kScope)
  class Dep {
    message() {
      return 'hello world'
    }
  }

  @Injectable()
  class NonDep {}

  class Decorated extends Dep {
    constructor(readonly dep: Dep) {
      super()
    }

    message(): string {
      return `the message is ${this.dep.message()}`
    }
  }

  class PpOne implements PostProcessor {
    afterInit(instance: unknown, ctx: ResolutionContext): unknown {
      ppSpy()

      if (instance instanceof Dep) {
        return new Decorated(instance)
      }

      return instance
    }

    beforeInit(instance: unknown, ctx: ResolutionContext): unknown {
      ppSpy()
      return instance
    }
  }

  class PpTwo implements PostProcessor {
    afterInit(instance: unknown, ctx: ResolutionContext): unknown {
      ppSpy()
      return instance
    }

    beforeInit(instance: unknown, ctx: ResolutionContext): unknown {
      ppSpy()
      return instance
    }
  }

  const ppOne = new PpOne()
  const ppTwo = new PpTwo()

  beforeAll(() => {
    DI.bindScope(kScope, new CustomTransient())
    DI.addPostProcessor(new PpOne())
    DI.addPostProcessor(new PpTwo())
  })

  afterAll(() => {
    DI.unbindScope(kScope)
    DI.removePostProcessor(ppOne)
    DI.removePostProcessor(ppTwo)
  })

  it('should execute post processors calling the provider just one time per execution', async function () {
    const di = DI.setup()
    const dep = di.get(Dep)
    const nonDep = di.get(NonDep)

    await di.dispose()

    expect(ppSpy).toHaveBeenCalledTimes(8)
    expect(sSpy).toHaveBeenCalledTimes(1)
    expect(nonDep).toBeInstanceOf(NonDep)
    expect(dep).toBeInstanceOf(Decorated)
    expect(dep.message()).toEqual('the message is hello world')
  })
})
