import { expect } from '@jest/globals'
import { v4 } from 'uuid'
import { Provides } from '../decorators/Provides.js'
import { Provider } from '../Provider.js'
import { DI } from '../DI.js'
import { TransientScoped } from '../decorators/TransientScoped.js'
import { ResolutionContext } from '../ResolutionContext.js'
import { Injectable } from '../decorators/Injectable.js'
import { Inject } from '../decorators/Inject.js'

describe('Provides', function () {
  class Repo<T = any> {
    readonly id: string = v4()

    constructor(readonly model: T) {}

    name() {
      return (this.model as any).name
    }
  }

  class RepoProvider<T = any> implements Provider<Repo<T>> {
    provide(ctx: ResolutionContext): Repo<T> {
      return new Repo<T>(ctx.token as any)
    }
  }

  @Provides(new RepoProvider())
  class User {}

  @Provides(new RepoProvider())
  @TransientScoped()
  class TrUser {}

  @Injectable()
  class Svc {
    constructor(@Inject(User) readonly repo: Repo<User>) {}
  }

  it('should provide another bean instance different from the decorated type', function () {
    const di = DI.setup()
    const repo = di.get<Repo<User>>(User)
    const repo2 = di.get<Repo>(User)

    expect(repo).toBeInstanceOf(Repo)
    expect(repo.name()).toEqual('User')
    expect(repo.id).toEqual(repo2.id)
  })

  it('should provide another bean respecting configurations set on token class', function () {
    const di = DI.setup()
    const repo = di.get<Repo<User>>(TrUser)
    const repo2 = di.get<Repo>(TrUser)

    expect(repo).toBeInstanceOf(Repo)
    expect(repo.name()).toEqual('TrUser')
    expect(repo.id).not.toEqual(repo2.id)
  })

  it('should inject provided component', function () {
    const di = DI.setup()
    const svc = di.get(Svc)

    expect(svc).toBeInstanceOf(Svc)
    expect(svc.repo).toBeInstanceOf(Repo)
    expect(svc.repo.name()).toEqual('User')
  })
})
