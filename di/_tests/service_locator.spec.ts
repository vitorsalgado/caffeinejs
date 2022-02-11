import { expect } from '@jest/globals'
import { v4 } from 'uuid'
import { Injectable } from '../decorators/Injectable.js'
import { ScopedAs } from '../decorators/ScopedAs.js'
import { DI } from '../DI.js'
import { Scopes } from '../Scopes.js'
import { ServiceLocator } from '../ServiceLocator.js'

describe('Service Locator', function () {
  @Injectable()
  @ScopedAs(Scopes.CONTAINER)
  class Svc {
    readonly id: string = v4()

    test() {
      return 'hello world'
    }
  }

  it('should create a singleton service locator', function () {
    const di = DI.setup()
    const sl1 = di.get(ServiceLocator)
    const svc11 = sl1.get(Svc)
    const svc12 = sl1.get(Svc)
    const svc13 = di.get(Svc)

    const child = di.newChild()
    const sl2 = child.get(ServiceLocator)
    const svc21 = sl2.get(Svc)
    const svc22 = sl2.get(Svc)
    const svc23 = child.get(Svc)

    expect(sl1).toBeInstanceOf(ServiceLocator)
    expect(sl2).toBeInstanceOf(ServiceLocator)

    expect(svc11).toBeInstanceOf(Svc)
    expect(svc12).toBeInstanceOf(Svc)
    expect(svc13).toBeInstanceOf(Svc)
    expect(svc11).toEqual(svc12)
    expect(svc12).toEqual(svc13)

    expect(svc21).toBeInstanceOf(Svc)
    expect(svc22).toBeInstanceOf(Svc)
    expect(svc23).toBeInstanceOf(Svc)
    expect(svc21).toEqual(svc22)
    expect(svc22).toEqual(svc23)

    expect(svc11).not.toEqual(svc21)
    expect(sl1).not.toEqual(sl2)

    expect(svc11.test()).toEqual('hello world')
    expect(svc21.test()).toEqual('hello world')
  })
})
