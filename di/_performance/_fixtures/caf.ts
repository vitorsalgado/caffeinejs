import { Injectable } from '../../decorators/index.js'
import { TransientScoped } from '../../decorators/index.js'

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
