import { jest } from '@jest/globals'
import { expect } from '@jest/globals'
import { Token } from '../Token.js'
import { Binding } from '../Binding.js'
import { DI } from '../DI.js'
import { ConditionalOn } from '../decorators/ConditionalOn.js'
import { Configuration } from '../decorators/Configuration.js'
import { Namespace } from '../decorators/Namespace.js'
import { Bean } from '../decorators/Bean.js'
import { Injectable } from '../decorators/Injectable.js'
import { ContainerLifecycle } from '../Container.js'

describe('Inspections', function () {
  const spy = jest.fn()

  class Inspector implements ContainerLifecycle {
    onBinding(token: Token, binding: Binding): void {
      spy()
    }

    onNotBound(token: Token, binding: Binding): void {
      spy()
    }

    onBound(token: Token, binding: Binding): void {
      spy()
    }
  }

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

  it('should call inspector methods on container specific registration steps', function () {
    DI.inspector(new Inspector())
    DI.setup()

    expect(spy).toHaveBeenCalledTimes(12)
  })
})
