import { v4 } from 'uuid'
import { expect } from '@jest/globals'
import { Lifecycle } from '../../../Lifecycle.js'
import { Refresh } from '../../../decorators/Refresh.js'
import { DI } from '../../../DI.js'
import { RefreshScope } from '../RefreshScope.js'
import { ScopedAs } from '../../../decorators/ScopedAs.js'
import { Injectable } from '../../../decorators/Injectable.js'

describe('Refresh Scope', function () {
  @Injectable()
  @ScopedAs(Lifecycle.REFRESH)
  class Dep {
    readonly id: string = v4()
  }

  @Injectable()
  @Refresh()
  class Root {
    readonly id: string = v4()

    constructor(readonly dep: Dep) {}
  }

  @Injectable()
  class Out {
    readonly id: string = v4()
  }

  describe('when request a scope refresh', function () {
    it('should reset refresh scoped components', async function () {
      const di = DI.setup()
      const scope = DI.getScope<RefreshScope>(Lifecycle.REFRESH)

      const root = di.get(Root)
      const out = di.get(Out)

      expect(root).toEqual(di.get(Root))
      expect(out).toEqual(di.get(Out))

      await scope.refresh()

      const rootAfter = di.get(Root)
      const outAfter = di.get(Out)

      expect(root).not.toEqual(rootAfter)
      expect(out).toEqual(outAfter)
    })
  })
})
