import { Injectable } from '../decorators/Injectable.js'
import { DI } from '../DI.js'

describe('Injecting On Functions', function () {
  const kVal = Symbol('test')

  class Opt {}

  @Injectable()
  class Dep {
    value = 'test'
  }

  @Injectable(kVal)
  class Nm {
    id = 'dev'
  }

  it('should resolve functions injecting required dependencies', function () {
    const di = DI.setup()
    const fn = (dep: Dep, nm: Nm, opt?: Opt) => (message: string) =>
      `received: ${message} - ${dep.value} - ${nm.id} - ${opt === undefined}`

    di.bind(fn).toFunction(fn, [DI.arg(Dep), DI.arg(kVal), { token: Opt, optional: true }])

    const theFunction = di.get<(message: string) => string>(fn)
    const res = theFunction('hello')

    expect(res).toEqual('received: hello - test - dev - true')
  })
})
