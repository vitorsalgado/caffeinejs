import { beforeAll } from '@jest/globals'
import { afterAll } from '@jest/globals'
import { expect } from '@jest/globals'
import { jest } from '@jest/globals'
import { Injectable } from '../decorators/Injectable.js'
import { ScopedAs } from '../decorators/ScopedAs.js'
import { DI } from '../DI.js'
import { Provider } from '../internal/Provider.js'
import { ProviderContext } from '../internal/Provider.js'
import { TransientScope } from '../internal/TransientScope.js'
import { PostProcessor } from '../PostProcessor.js'
import { Scope } from '../Scope.js'
import { Token } from '../Token.js'

describe('Post Processors', function () {
  const ppSpy = jest.fn()
  const sSpy = jest.fn()
  const kScope = Symbol('custom_transient')

  class CustomTransient implements Scope {
    private readonly transient = new TransientScope()

    scope(token: Token, unscoped: Provider<any>): Provider<any> {
      sSpy()
      return this.transient.scope(token, unscoped)
    }
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
    afterInit(instance: unknown, ctx: ProviderContext): unknown {
      ppSpy()

      if (instance instanceof Dep) {
        return new Decorated(instance)
      }

      return instance
    }

    beforeInit(instance: unknown, ctx: ProviderContext): unknown {
      ppSpy()
      return instance
    }
  }

  class PpTwo implements PostProcessor {
    afterInit(instance: unknown, ctx: ProviderContext): unknown {
      ppSpy()
      return instance
    }

    beforeInit(instance: unknown, ctx: ProviderContext): unknown {
      ppSpy()
      return instance
    }
  }

  const ppOne = new PpOne()
  const ppTwo = new PpTwo()

  beforeAll(() => {
    DI.bindScope(kScope, new CustomTransient())
    DI.bindPostProcessor(new PpOne())
    DI.bindPostProcessor(new PpTwo())
  })

  afterAll(() => {
    DI.unbindScope(kScope)
    DI.unbindPostProcessor(ppOne)
    DI.unbindPostProcessor(ppTwo)
  })

  it('should execute post processors calling the provider just one time per execution', async function () {
    const di = DI.setup()
    const dep = di.get(Dep)
    const nonDep = di.get(NonDep)

    await di.finalize()

    expect(ppSpy).toHaveBeenCalledTimes(8)
    expect(sSpy).toHaveBeenCalledTimes(1)
    expect(nonDep).toBeInstanceOf(NonDep)
    expect(dep).toBeInstanceOf(Decorated)
    expect(dep.message()).toEqual('the message is hello world')
  })
})
