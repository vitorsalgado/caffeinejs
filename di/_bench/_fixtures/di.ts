import { Injectable } from '../../decorators/index.js'
import { TransientScoped } from '../../decorators/index.js'
import { Inject } from '../../decorators/index.js'
import { DI } from '../../DI.js'
import { Named } from '../../decorators/index.js'

export interface Caf {
  get(): string
}

@Injectable()
export class CafRepository {
  find() {
    return 'data'
  }
}

@Injectable()
export class CafService {
  constructor(readonly repository: CafRepository) {}
}

@Injectable()
export class CafRoot {
  constructor(readonly service: CafService) {}
}

@Injectable()
@TransientScoped()
@Named('caf')
export class CafDep implements Caf {
  get(): string {
    return 'dep'
  }
}

@Injectable()
@TransientScoped()
export class CafTransientRoot {
  constructor(@Inject('caf') readonly dep: Caf) {}
}

const di = DI.setup()

export { di }
