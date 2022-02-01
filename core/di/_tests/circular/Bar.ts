import { Defer } from '../../decorators/Defer.js'
import { Injectable } from '../../decorators/Injectable.js'
import { Scope } from '../../decorators/Scope.js'
import { Lifecycle } from '../../Lifecycle.js'
import { Foo } from './Foo.js'

@Injectable()
@Scope(Lifecycle.TRANSIENT)
export class Bar {
  constructor(@Defer(() => Foo) readonly foo: Foo) {}

  id = () => 'bar'

  test(): string {
    return `bar-${this.foo.id()}`
  }
}
