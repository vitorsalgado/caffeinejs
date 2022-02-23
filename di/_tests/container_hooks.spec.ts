import { jest } from '@jest/globals'
import { expect } from '@jest/globals'
import { DI } from '../DI.js'
import { ConditionalOn } from '../decorators/ConditionalOn.js'
import { Configuration } from '../decorators/Configuration.js'
import { Namespace } from '../decorators/Namespace.js'
import { Bean } from '../decorators/Bean.js'
import { Injectable } from '../decorators/Injectable.js'

describe('Container Lifecycle Listener', function () {
  const spy = jest.fn()

  // 1
  @Injectable()
  class Dep {}

  // 2
  @Injectable()
  @ConditionalOn(() => false)
  class NotValid {}

  // 3
  @Injectable()
  @Namespace('test')
  class OtherNamespace {}

  // 4
  @Configuration()
  class Conf {
    // 5
    @Bean(Symbol('test1'))
    @ConditionalOn(() => false)
    test1() {
      return 'test1'
    }

    // 6
    @Bean(Symbol('test2'))
    test2() {
      return 'test2'
    }
  }

  it('should call inspector methods on container specific registration steps', async function () {
    const di = new DI()

    di.hooks.on('onSetup', () => spy())
    di.hooks.on('onBindingRegistered', () => spy())
    di.hooks.on('onBindingNotRegistered', () => spy())
    di.hooks.on('onSetupComplete', () => spy())
    di.hooks.on('onDisposed', () => spy())

    di.setup()

    await di.dispose()

    expect(spy).toHaveBeenCalledTimes(14)
  })
})
