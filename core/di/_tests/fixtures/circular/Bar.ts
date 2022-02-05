import { Defer } from '../../../decorators/Defer.js'
import { Injectable } from '../../../decorators/Injectable.js'
import { Scoped } from '../../../decorators/Scoped.js'
import { Lifecycle } from '../../../Lifecycle.js'
import { Foo } from './Foo.js'

@Injectable()
@Scoped(Lifecycle.TRANSIENT)
export class Bar {
  constructor(@Defer(() => Foo) readonly foo: Foo) {}

  id = () => 'bar'

  test(): string {
    return `bar-${this.foo.id()}`
  }
}
