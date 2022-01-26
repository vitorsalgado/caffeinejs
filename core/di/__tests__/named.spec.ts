import { v4 } from 'uuid'
import { DI } from '../DI.js'
import { Inject } from '../Inject.js'
import { Injectable } from '../Injectable.js'
import { Named } from '../Named.js'

describe('DI - Named Dependencies', function () {
  const ack = Symbol.for('ok')

  @Injectable()
  @Named('bye')
  class ByeService {
    readonly id: string = v4()

    bye(): string {
      return 'bye-bye'
    }
  }

  @Injectable()
  @Named(ack)
  class AckService {
    readonly id: string = v4()

    constructor(private readonly byeService: ByeService) {}

    ok(): string {
      return `ok-${this.byeService.bye()}`
    }
  }

  @Injectable()
  class Root {
    readonly id: string = v4()

    constructor(@Inject('bye') readonly byeService: ByeService, @Inject(ack) readonly ackService: AckService) {}
  }

  it('should resolve based on dependency qualifier', function () {
    const root = DI.setup().resolve(Root)

    expect(root.byeService.bye()).toEqual('bye-bye')
    expect(root.ackService.ok()).toEqual('ok-bye-bye')
  })
})