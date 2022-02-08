import { Defer } from '../../../decorators/Defer.js'
import { Injectable } from '../../../decorators/Injectable.js'
import { ScopedAs } from '../../../decorators/ScopedAs.js'
import { Scopes } from '../../../Scopes.js'
import { Foo } from './Foo.js'

@Injectable()
@ScopedAs(Scopes.TRANSIENT)
export class Bar {
  constructor(@Defer(() => Foo) readonly foo: Foo) {}

  id = () => 'bar'

  test(): string {
    return `bar-${this.foo.id()}`
  }
}
