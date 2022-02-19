import { DI } from '../../DI.js'
import { Injectable } from '../../decorators/Injectable.js'
import { TransientScoped } from '../../decorators/TransientScoped.js'

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

@Injectable()
class RepSingleton {}

@Injectable()
class SvcSingleton {
  constructor(readonly repo: RepSingleton) {}
}

@Injectable()
export class RootSingleton {
  constructor(readonly svc: SvcSingleton) {}
}

const di = DI.setup()

export { di }
