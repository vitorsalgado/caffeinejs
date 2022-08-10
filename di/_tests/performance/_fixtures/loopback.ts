import { Context, inject, injectable } from '@loopback/context'

@injectable()
class LoopRep {}

@injectable()
class LoopSvc {
  constructor(@inject(LoopRep.name) readonly repo: LoopRep) {}
}

@injectable()
export class LoopRoot {
  constructor(@inject(LoopSvc.name) readonly svc: LoopSvc) {}
}

const ctx = new Context()

ctx.bind(LoopRep.name).toClass(LoopRep)
ctx.bind(LoopSvc.name).toClass(LoopSvc)
ctx.bind(LoopRoot.name).toClass(LoopRoot)

export { ctx as loopCtx }
