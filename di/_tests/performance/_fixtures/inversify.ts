import { injectable } from 'inversify'
import { Container } from 'inversify'

@injectable()
class InvRep {}

@injectable()
class InvSvc {
  constructor(readonly repo: InvRep) {}
}

@injectable()
export class InvRoot {
  constructor(readonly svc: InvSvc) {}
}

const inv = new Container()

inv.bind(InvRep).toSelf()
inv.bind(InvSvc).toSelf()
inv.bind(InvRoot).toSelf()

export { inv }
