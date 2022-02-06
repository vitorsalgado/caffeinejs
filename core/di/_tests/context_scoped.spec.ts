import { v4 } from 'uuid'
import { DI } from '../DI.js'
import { Injectable } from '../decorators/Injectable.js'
import { Scopes } from '../Scopes.js'
import { ResolutionContext } from '../ResolutionContext.js'
import { Scoped } from '../decorators/Scoped.js'

describe('DI - Context Scoped', function () {
  @Injectable()
  @Scoped(Scopes.RESOLUTION_CONTEXT)
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
  @Scoped(Scopes.TRANSIENT)
  class ResScopedRoot {
    constructor(readonly dep: ResScopedDep) {}
  }

  it('should return instance stored in the resolution context when one is provided', function () {
    const context = new ResolutionContext()
    const di = DI.setup()
    const result1 = di.get(ResScopedRoot, context)
    const result2 = di.get(ResScopedRoot, context)

    context.resolutions.clear()

    const result3 = di.get(ResScopedRoot, context)

    expect(result1).toEqual(result2)
    expect(result1).not.toEqual(result3)
    expect(result2).not.toEqual(result3)
  })
})
