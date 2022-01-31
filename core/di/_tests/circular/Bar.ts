import { Injectable } from '../../decorators/Injectable.js'
import { Defer } from '../../decorators/Defer.js'
import { Foo } from './Foo.js'

@Injectable()
export class Bar {
  constructor(@Defer(() => Foo) readonly foo: Foo) {}

  id = () => 'bar'

  test(): string {
    return `bar-${this.foo.id()}`
  }
}
