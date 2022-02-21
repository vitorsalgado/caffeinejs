import { jest } from '@jest/globals'
import { Injectable } from '../decorators/Injectable.js'
import { Lazy } from '../decorators/Lazy.js'
import { Scoped } from '../decorators/Scoped.js'
import { DI } from '../DI.js'
import { Lifecycle } from '../Lifecycle.js'

describe('Init Singleton and Container Scoped', function () {
  const spy1 = jest.fn()
  const spy2 = jest.fn()
  const spy3 = jest.fn()
  const spy4 = jest.fn()
  const spy5 = jest.fn()

  @Injectable()
  class Dep1 {
    constructor() {
      spy1()
    }
  }

  @Injectable()
  @Scoped(Lifecycle.CONTAINER)
  class Dep2 {
    constructor() {
      spy2()
    }
  }

  @Injectable()
  @Scoped(Lifecycle.TRANSIENT)
  class Dep3 {
    constructor() {
      spy3()
    }
  }

  @Injectable()
  @Lazy()
  class Dep4 {
    constructor() {
      spy4()
    }
  }

  @Injectable()
  @Scoped(Lifecycle.TRANSIENT)
  @Lazy(false)
  class Dep5 {
    constructor() {
      spy5()
    }
  }

  it('should init all injectables except ones marked as lazy', function () {
    const di = DI.setup()

    di.initInstances()

    const dep1 = di.get(Dep1)
    const dep2 = di.get(Dep2)

    expect(spy1).toHaveBeenCalledTimes(1)
    expect(spy2).toHaveBeenCalledTimes(1)
    expect(spy3).not.toHaveBeenCalled()
    expect(spy4).not.toHaveBeenCalled()
    expect(spy5).toHaveBeenCalledTimes(0)
    expect(dep1).toBeInstanceOf(Dep1)
    expect(dep2).toBeInstanceOf(Dep2)
  })
})
