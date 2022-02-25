import { AsyncProvider } from '../internal/providers/AsyncProvider.js'
import { ResolutionContext } from '../ResolutionContext.js'
import { DI } from '../DI.js'

describe('Async Providers', function () {
  class Dep {
    constructor(readonly message: string) {}
  }

  class Root {
    constructor(readonly message: string) {}
  }

  class Async extends AsyncProvider<unknown> {
    provide(ctx: ResolutionContext<unknown>): Promise<unknown> {
      return new Promise<unknown>(resolve => {
        setTimeout(() => resolve(new Root('async')), 500)
      })
    }
  }

  it('should resolve async component', async function () {
    const di = new DI()

    di.setup()
    di.bind(Root).toProvider(new Async() as any)

    const dep = await di.getAsync(Root)

    expect(dep).toBeInstanceOf(Root)
    expect(dep.message).toEqual('async')
  })
})
