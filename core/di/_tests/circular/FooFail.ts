import { Injectable } from '../../decorators/Injectable.js'
import { BarFail } from './BarFail.js'

@Injectable()
export class FooFail {
  constructor(readonly bar: BarFail) {}

  id = () => 'foo'

  test(): string {
    return `foo-${this.bar.id()}`
  }
}
