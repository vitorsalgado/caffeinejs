import { expect } from '@jest/globals'
import { jest } from '@jest/globals'
import { beforeEach } from '@jest/globals'
import { Injectable } from '../decorators/Injectable.js'
import { ProvidedBy } from '../decorators/ProvidedBy.js'
import { DI } from '../DI.js'
import { ClassProvider } from '../internal/providers/ClassProvider.js'
import { Provider } from '../Provider.js'
import { ResolutionContext } from '../ResolutionContext.js'
import { Ctor } from '../internal/types.js'

describe('Provided By', function () {
  const spy = jest.fn()

  beforeEach(() => {
    spy.mockReset()
  })

  class LogSetterProvider<T> implements Provider<T> {
    private readonly clazzProvider: ClassProvider

    constructor(clazz: Ctor) {
      this.clazzProvider = new ClassProvider<T>(clazz)
    }

    provide(ctx: ResolutionContext): T {
      const instance = this.clazzProvider.provide(ctx)

      if ('Log' in instance.constructor) {
        instance.constructor.Log = () => spy()
      }

      return instance
    }
  }

  @Injectable()
  @ProvidedBy(new LogSetterProvider(Loggable))
  class Loggable {
    static Log: () => void
  }

  @Injectable()
  @ProvidedBy(() => {
    spy()
    return new Dep('created')
  })
  class Dep {
    constructor(readonly status: string) {}
  }

  it('should use custom provider provided in the decorator', function () {
    const di = DI.setup()
    const loggable = di.get(Loggable)

    Loggable.Log()

    expect(loggable).toBeInstanceOf(Loggable)
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('should use a factory provider using the function provided in the decorator', function () {
    const di = DI.setup()
    const dep = di.get(Dep)

    expect(spy).toHaveBeenCalledTimes(1)
    expect(dep).toBeInstanceOf(Dep)
  })
})
