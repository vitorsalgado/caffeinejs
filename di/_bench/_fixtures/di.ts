import { Injectable } from '../../decorators/Injectable.js'
import { Transient } from '../../decorators/Transient.js'
import { Named } from '../../decorators/Named.js'
import { Inject } from '../../decorators/Inject.js'
import { DI } from '../../DI.js'

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
@Transient()
@Named('caf')
export class CafDep implements Caf {
  get(): string {
    return 'dep'
  }
}

@Injectable()
@Transient()
export class CafTransientRoot {
  constructor(@Inject('caf') readonly dep: Caf) {}
}

const di = DI.setup()

export { di }
