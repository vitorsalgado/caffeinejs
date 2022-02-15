import { expect } from '@jest/globals'
import { jest } from '@jest/globals'
import { Injectable } from '../decorators/Injectable.js'
import { DI } from '../DI.js'
import { ProviderContext } from '../internal/Provider.js'
import { PostProcessor } from '../PostProcessor.js'

describe('Post Processors', function () {
  const spy = jest.fn()

  @Injectable()
  class Dep {
    message() {
      return 'hello world'
    }
  }

  @Injectable()
  class NonDep {}

  class Decorated extends Dep {
    constructor(dep: Dep) {
      super()
    }

    message(): string {
      return `the message is ${super.message()}`
    }
  }

  class TestPostProcessor implements PostProcessor {
    afterInit(instance: unknown, ctx: ProviderContext): unknown {
      if (instance instanceof Dep) {
        return new Decorated(instance)
      }

      spy()

      return instance
    }

    beforeInit(instance: unknown, ctx: ProviderContext): unknown {
      spy()
      return instance
    }
  }

  it('should ', async function () {
    DI.bindPostProcessor(new TestPostProcessor())

    const di = DI.setup()
    const dep = di.get(Dep)
    const nonDep = di.get(NonDep)

    await di.finalize()

    expect(spy).toHaveBeenCalledTimes(3)
    expect(nonDep).toBeInstanceOf(NonDep)
    expect(dep).toBeInstanceOf(Decorated)
    expect(dep.message()).toEqual('the message is hello world')
  })
})
