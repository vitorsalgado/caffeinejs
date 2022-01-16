import { Injectable } from '../../Injectable.js'
import { Defer } from '../../Defer.js'
import { Foo } from './Foo.js'

@Injectable()
export class Bar {
  constructor(@Defer(() => Foo) readonly foo: Foo) {}

  id = () => 'bar'

  test(): string {
    return `bar-${this.foo.id()}`
  }
}
