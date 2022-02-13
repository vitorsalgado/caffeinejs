import { jest } from '@jest/globals'
import { expect } from '@jest/globals'
import { v4 } from 'uuid'
import { PostConstruct } from '../decorators/PostConstruct.js'
import { Inject } from '../decorators/Inject.js'
import { Injectable } from '../decorators/Injectable.js'
import { DI } from '../DI.js'

describe('Post Construct', function () {
  const stack: string[] = []
  const spy = jest.fn()

  @Injectable()
  class Dep {}

  @Injectable()
  class Prop {}

  @Injectable()
  class Svc {}

  @Injectable()
  class Component {
    id: string = v4()

    @Inject()
    prop!: Prop
    svc!: Svc

    constructor(readonly dep: Dep) {
      stack.push('ctor')
      expect(this.dep).toBeDefined()
      expect(this.prop).toBeUndefined()
      expect(this.svc).toBeUndefined()
    }

    @PostConstruct()
    init() {
      spy()
      stack.push('init')
      expect(this.dep).toBeDefined()
      expect(this.svc).toBeDefined()
      expect(this.prop).toBeDefined()
    }

    @Inject()
    setSvc(svc: Svc) {
      this.svc = svc
      stack.push('method')
    }
  }

  it('should execute after resolution hook in all resolutions request and after constructor, properties and setter methods injection', function () {
    const di = DI.setup()

    di.get(Component)
    di.get(Component)

    expect(spy).toHaveBeenCalledTimes(2)
    expect(stack).toEqual(['ctor', 'method', 'init', 'method', 'init'])
  })
})
