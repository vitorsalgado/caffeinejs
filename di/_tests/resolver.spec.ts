import { Inject } from '../decorators/Inject.js'
import { Injectable } from '../decorators/Injectable.js'
import { DI } from '../DI.js'

describe('Custom Resolver', function () {
  abstract class Base {
    abstract id: string

    name() {
      return 'base'
    }
  }

  class Repository<T extends Base> {
    constructor(readonly entity: T) {}
  }

  class User extends Base {
    id = 'user-entity'

    name(): string {
      return 'user'
    }
  }

  @Injectable()
  class UserService {
    constructor(@Inject(User) readonly repository: Repository<User>) {}
  }

  class Repo {
    constructor(private readonly token?: string) {}

    find() {
      return `test-${this.token ? this.token : 'empty'}`
    }
  }

  @Injectable()
  class Service {
    constructor(readonly repo: Repo) {}
  }

  it('should allow set factory for unregistered component', function () {
    const di = DI.setup()

    di.bind(Repo).toFactory(() => new Repo())

    const service = di.get(Service)
    const repo = di.get(Repo)

    expect(service.repo.find()).toEqual('test-empty')
    expect(repo.find()).toEqual('test-empty')
  })

  it('should resolve unregistered generic type based on @Inject() token', function () {
    const di = DI.setup()

    di.bind<Repository<User> | undefined>(Repository).toFactory(ctx => {
      if (ctx.token === User) {
        return new Repository<User>(new User())
      }

      return undefined
    })

    const userService = di.get(UserService)

    expect(userService.repository.entity.id).toEqual('user-entity')
    expect(userService.repository.entity.name()).toEqual('user')
  })
})
