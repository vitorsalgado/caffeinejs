import { singleton } from 'tsyringe'
import { injectable } from 'tsyringe'
import { inject } from 'tsyringe'
import { container as tsyringeContainer } from 'tsyringe'

export interface Tsy {
  get(): string
}

@singleton()
export class TsyRepository {
  find() {
    return 'data'
  }
}

@singleton()
export class TsyService {
  constructor(readonly repository: TsyRepository) {}
}

@singleton()
export class TsyRoot {
  constructor(readonly service: TsyService) {}
}

@injectable()
export class TsyDep implements Tsy {
  get(): string {
    return 'dep'
  }
}

@injectable()
export class TsyTransientRoot {
  constructor(@inject('tsy') readonly dep: Tsy) {}
}

tsyringeContainer.register('tsy', { useClass: TsyDep })

export { tsyringeContainer }
