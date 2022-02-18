import { Injectable } from '../../decorators/index.js'
import { TransientScoped } from '../../decorators/index.js'
import { DI } from '../../DI.js'

@Injectable()
@TransientScoped()
class Rep {}

@Injectable()
@TransientScoped()
class Svc {
  constructor(readonly repo: Rep) {}
}

@Injectable()
@TransientScoped()
export class Root {
  constructor(readonly svc: Svc) {}
}

const di = DI.setup()

export { di }
