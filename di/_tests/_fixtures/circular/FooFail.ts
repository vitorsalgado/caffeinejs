import { Injectable } from '../../../decorators/Injectable.js'
import { TypeOf } from '../../../TypeOf.js'
import { BarFail } from './BarFail.js'

@Injectable()
export class FooFail {
  constructor(readonly bar: TypeOf<BarFail>) {}

  id = () => 'foo'

  test(): string {
    return `foo-${this.bar.id()}`
  }
}
