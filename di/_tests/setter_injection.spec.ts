import { Injectable } from '../decorators/Injectable.js'
import { Inject } from '../decorators/Inject.js'
import { DI } from '../DI.js'
import { Optional } from '../decorators/Optional.js'

describe('Setter Injection', function () {
  const kNm = Symbol('test')
  const kNone = Symbol('none')

  @Injectable()
  class Dep {
    greetings() {
      return 'oi'
    }
  }

  @Injectable(kNm)
  class Nm {
    farewell() {
      return 'tchau'
    }
  }

  @Injectable()
  class Root {
    private _dep!: Dep
    private _nm!: Nm
    private _val!: string

    @Optional(kNone)
    set none(val: string) {
      this._val = val
    }

    get none() {
      return this._val
    }

    @Inject()
    set dep(dep: Dep) {
      this._dep = dep
    }

    get dep() {
      return this._dep
    }

    @Inject(kNm)
    set nm(nm: Nm) {
      this._nm = nm
    }

    get nm() {
      return this._nm
    }

    message() {
      return this._dep.greetings() + ' tchau'
    }

    otherMessage() {
      return this._nm.farewell() + ' oi'
    }
  }

  it('should inject dependency using a setter', function () {
    const di = DI.setup()
    const root = di.get(Root)

    expect(root).toBeInstanceOf(Root)

    expect(root.message()).toEqual('oi tchau')
    expect(root.otherMessage()).toEqual('tchau oi')

    expect(root.none).toBeUndefined()
    expect(root.dep.greetings()).toEqual('oi')
    expect(root.nm.farewell()).toEqual('tchau')
  })
})
