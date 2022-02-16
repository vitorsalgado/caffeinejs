import { v4 } from 'uuid'
import { Defer } from '../../../decorators/Defer.js'
import { Injectable } from '../../../decorators/Injectable.js'
import { TypeOf } from '../../../TypeOf.js'
import { Bar } from './Bar.js'

@Injectable()
export class Foo {
  uuid: string = v4()

  constructor(@Defer(() => Bar) readonly bar: TypeOf<Bar>) {}

  id = () => 'foo'

  test(): string {
    return `foo-${this.bar.id()}`
  }
}
