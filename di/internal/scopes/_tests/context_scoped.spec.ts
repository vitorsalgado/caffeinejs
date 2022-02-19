import { v4 } from 'uuid'
import { expect } from '@jest/globals'
import { DI } from '../../../DI.js'
import { Injectable } from '../../../decorators/Injectable.js'
import { Lifecycle } from '../../../Lifecycle.js'
import { Scoped } from '../../../decorators/Scoped.js'
import { MissingRequiredProviderArgumentError } from '../../errors.js'
import { LocalResolutions } from '../../../LocalResolutions.js'
import { Binding } from '../../../Binding.js'

describe('Context Resolution Scoped', function () {
  @Injectable()
  @Scoped(Lifecycle.LOCAL_RESOLUTION)
  class ResScopedDep {
    readonly id: string

    constructor() {
      this.id = v4()
    }

    test() {
      return 'hello-world'
    }
  }

  @Injectable()
  @Scoped(Lifecycle.TRANSIENT)
  class ResScopedRoot {
    constructor(readonly dep: ResScopedDep) {}
  }

  it('should return instance stored in the resolution context when one is provided', function () {
    const context = new LocalResolutions()
    const di = DI.setup()
    const result1 = di.get(ResScopedRoot, context)
    const result2 = di.get(ResScopedRoot, context)

    context.resolutions.clear()

    const result3 = di.get(ResScopedRoot, context)
    const dep1 = di.get(ResScopedDep)
    const b = di.getBindings(ResScopedDep)[0]

    expect(result1).toEqual(result2)
    expect(result1).not.toEqual(result3)
    expect(result2).not.toEqual(result3)

    context.delete(b)

    const dep2 = di.get(ResScopedDep, context)

    expect(dep1).not.toEqual(dep2)
  })

  it('should accept a custom local resolutions instance', function () {
    const context = new (class extends LocalResolutions {
      get = <T>(key: Binding): T | undefined => this.resolutions.get(key) as T | undefined
      set = (key: Binding, value: unknown) => this.resolutions.set(key, value)
      has = (key: Binding) => this.resolutions.has(key)
    })()
    const di = DI.setup()
    const result1 = di.get(ResScopedRoot, context)
    const result2 = di.get(ResScopedRoot, context)

    context.resolutions.clear()

    const result3 = di.get(ResScopedRoot, context)

    expect(result1).toEqual(result2)
    expect(result1).not.toEqual(result3)
    expect(result2).not.toEqual(result3)
  })

  it('should fail when no local resolutions is passed on resolve request', function () {
    const di = DI.setup()
    expect(() => di.get(ResScopedRoot, {})).toThrow(MissingRequiredProviderArgumentError)
  })
})
