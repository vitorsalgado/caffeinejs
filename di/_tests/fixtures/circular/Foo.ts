import { Defer } from '../../../decorators/Defer.js'
import { Injectable } from '../../../decorators/Injectable.js'
import { TypeOf } from '../../../internal/types/TypeOf.js'
import { Bar } from './Bar.js'

@Injectable()
export class Foo {
  constructor(@Defer(() => Bar) readonly bar: TypeOf<Bar>) {}

  id = () => 'foo'

  test(): string {
    return `foo-${this.bar.id()}`
  }
}
