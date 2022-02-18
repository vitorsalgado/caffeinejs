import { injectable } from 'tsyringe'
import { container as tsy } from 'tsyringe'

@injectable()
class TsyRep {}

@injectable()
class TsySvc {
  constructor(readonly repo: TsyRep) {}
}

@injectable()
export class TsyRoot {
  constructor(readonly svc: TsySvc) {}
}

export { tsy }
