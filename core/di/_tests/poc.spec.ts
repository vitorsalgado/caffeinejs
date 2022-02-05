import { Injectable } from '../decorators/Injectable.js'
import { DI } from '../DI.js'

describe('POC', function () {
  @Injectable()
  class Dep {}

  @Injectable()
  class Root {
    constructor(readonly dep: Dep) {}
  }

  it('should ', function () {
    const di = DI.setup()
    const root = di.get(Root)

    expect(root).toBeInstanceOf(Root)
    expect(root.dep).toBeInstanceOf(Dep)
  })
})
