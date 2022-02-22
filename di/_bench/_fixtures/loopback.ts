import LoopBack from '@loopback/context'
import { singleton } from 'tsyringe'

const Context = LoopBack.Context
const injectable = LoopBack.injectable
const inject = LoopBack.inject

export interface Loop {
  get(): string
}

@singleton()
export class LoopRepository {
  find() {
    return 'data'
  }
}

@singleton()
export class LoopService {
  constructor(@inject(LoopRepository.name) readonly repository: LoopRepository) {}
}

@singleton()
export class LoopRoot {
  constructor(@inject(LoopService.name) readonly service: LoopService) {}
}

@injectable()
export class LoopDep implements Loop {
  get(): string {
    return 'dep'
  }
}

@injectable()
export class LoopTransientRoot {
  constructor(@inject('loop') readonly dep: Loop) {}
}

const ctx = new Context()

ctx.bind('loop').toClass(LoopDep)
ctx.bind(LoopRepository.name).toClass(LoopRepository)
ctx.bind(LoopService.name).toClass(LoopService)
ctx.bind(LoopRoot.name).toClass(LoopRoot)
ctx.bind(LoopTransientRoot.name).toClass(LoopTransientRoot)

export { ctx as loopCtx }
