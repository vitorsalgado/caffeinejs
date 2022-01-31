import { v4 } from 'uuid'
import { DI } from '../DI.js'
import { Injectable } from '../decorators/Injectable.js'
import { Lifecycle } from '../Lifecycle.js'
import { ResolutionContext } from '../ResolutionContext.js'
import { Scope } from '../decorators/Scope.js'

describe('DI - Context Scoped', function () {
  @Injectable()
  @Scope(Lifecycle.RESOLUTION_CONTEXT)
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
  @Scope(Lifecycle.TRANSIENT)
  class ResScopedRoot {
    constructor(readonly dep: ResScopedDep) {}
  }

  it('should return instance stored in the resolution context when one is provided', function () {
    const context = new ResolutionContext()
    const di = DI.setup()
    const result1 = di.resolve(ResScopedRoot, context)
    const result2 = di.resolve(ResScopedRoot, context)

    context.resolutions.clear()

    const result3 = di.resolve(ResScopedRoot, context)

    expect(result1).toEqual(result2)
    expect(result1).not.toEqual(result3)
    expect(result2).not.toEqual(result3)
  })
})
