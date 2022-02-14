import { expect } from '@jest/globals'
import { jest } from '@jest/globals'
import { Injectable } from '../decorators/Injectable.js'
import { ProvidedBy } from '../decorators/ProvidedBy.js'
import { DI } from '../DI.js'
import { ClassProvider } from '../internal/ClassProvider.js'
import { ProviderContext } from '../internal/Provider.js'
import { Provider } from '../internal/Provider.js'
import { Ctor } from '../internal/types/Ctor.js'

describe('Provided By', function () {
  const spy = jest.fn()

  class LogSetterProvider<T> implements Provider<T> {
    private readonly clazzProvider: ClassProvider

    constructor(clazz: Ctor) {
      this.clazzProvider = new ClassProvider<T>(clazz)
    }

    provide(ctx: ProviderContext): T {
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

  it('should use custom provider provided by the decorator', function () {
    const di = DI.setup()
    const loggable = di.get(Loggable)

    Loggable.Log()

    expect(loggable).toBeInstanceOf(Loggable)
    expect(spy).toHaveBeenCalledTimes(1)
  })
})
