import { Injectable } from '../../../decorators/Injectable.js'
import { FooFail } from './FooFail.js'

@Injectable()
export class BarFail {
  constructor(readonly foo: FooFail) {}

  id = () => 'bar'

  test(): string {
    return `bar-${this.foo.id()}`
  }
}
