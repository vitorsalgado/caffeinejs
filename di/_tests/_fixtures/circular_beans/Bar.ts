import { v4 } from 'uuid'
import { TypeOf } from '../../../TypeOf.js'
import { Foo } from './Foo.js'

export class Bar {
  uuid: string = v4()

  constructor(readonly foo: TypeOf<Foo>) {}

  id = () => 'bar'

  test(): string {
    return `bar-${this.foo.id()}`
  }
}
