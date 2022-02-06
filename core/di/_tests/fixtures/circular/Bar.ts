import { Defer } from '../../../decorators/Defer.js'
import { Injectable } from '../../../decorators/Injectable.js'
import { Scoped } from '../../../decorators/Scoped.js'
import { BuiltInLifecycles } from '../../../BuiltInLifecycles.js'
import { Foo } from './Foo.js'

@Injectable()
@Scoped(BuiltInLifecycles.TRANSIENT)
export class Bar {
  constructor(@Defer(() => Foo) readonly foo: Foo) {}

  id = () => 'bar'

  test(): string {
    return `bar-${this.foo.id()}`
  }
}
