import { injectable } from 'inversify'
import { inject } from 'inversify'
import { Container } from 'inversify'

export interface Inv {
  get(): string
}

@injectable()
export class InvRepository {
  find() {
    return 'data'
  }
}

@injectable()
export class InvService {
  constructor(readonly repository: InvRepository) {}
}

@injectable()
export class InvRoot {
  constructor(readonly service: InvService) {}
}

@injectable()
export class InvDep implements Inv {
  get(): string {
    return 'dep'
  }
}

@injectable()
export class InvTransientRoot {
  constructor(@inject('inv') readonly dep: Inv) {}
}

const inversifyContainer = new Container()

inversifyContainer.bind(InvRepository).toSelf()
inversifyContainer.bind(InvService).toSelf()
inversifyContainer.bind(InvRoot).toSelf()
inversifyContainer.bind('inv').toConstructor(InvDep)
inversifyContainer.bind(InvTransientRoot).toSelf()

export { inversifyContainer }
