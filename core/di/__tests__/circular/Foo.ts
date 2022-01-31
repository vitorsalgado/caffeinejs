import { Injectable } from '../../decorators/Injectable.js'
import { Defer } from '../../decorators/Defer.js'
import { Bar } from './Bar.js'

@Injectable()
export class Foo {
  constructor(@Defer(() => Bar) readonly bar: Bar) {}

  id = () => 'foo'

  test(): string {
    return `foo-${this.bar.id()}`
  }
}
