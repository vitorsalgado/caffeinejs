import { DI } from '../../../DI.js'
import { Injectable } from '../../../decorators/Injectable.js'
import { Transient } from '../../../decorators/Transient.js'

@Injectable()
@Transient()
class Rep {}

@Injectable()
@Transient()
class Svc {
  constructor(readonly repo: Rep) {}
}

@Injectable()
@Transient()
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
