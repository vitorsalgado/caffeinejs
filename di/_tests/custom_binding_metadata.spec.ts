import { expect } from '@jest/globals'
import { DI } from '../DI.js'
import { DiSymbols } from '../DiSymbols.js'

describe('Custom Binding Metadata', function () {
  const kNm = Symbol('nm')

  class Dep {}

  class Opt {}

  class Nm {}

  class Root {
    static get [DiSymbols.kDeps]() {
      return [Dep, kNm, { token: Opt, optional: true }]
    }

    constructor(readonly dep: any, readonly nm: any, readonly opt?: any) {}
  }

  it('should ', function () {
    const di = DI.setup()

    di.bind(Dep).toSelf()
    di.bind(Nm).toSelf().qualifiers(kNm)
    di.bind(Root).toSelf()

    const root = di.get(Root)

    expect(root).toBeInstanceOf(Root)
    expect(root.dep).toBeInstanceOf(Dep)
    expect(root.nm).toBeInstanceOf(Nm)
    expect(root.opt).toBeUndefined()
  })
})
