import { v4 } from 'uuid'
import { Defer } from '../../../decorators/Defer.js'
import { Injectable } from '../../../decorators/Injectable.js'
import { Scoped } from '../../../decorators/Scoped.js'
import { TypeOf } from '../../../TypeOf.js'
import { Lifecycle } from '../../../Lifecycle.js'
import { Foo } from './Foo.js'

@Injectable()
@Scoped(Lifecycle.TRANSIENT)
export class Bar {
  uuid: string = v4()

  constructor(@Defer(() => Foo) readonly foo: TypeOf<Foo>) {}

  id = () => 'bar'

  test(): string {
    return `bar-${this.foo.id()}`
  }
}
