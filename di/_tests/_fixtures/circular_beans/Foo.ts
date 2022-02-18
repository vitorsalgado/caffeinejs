import { v4 } from 'uuid'
import { TypeOf } from '../../../TypeOf.js'
import { Bar } from './Bar.js'

export class Foo {
  uuid: string = v4()

  constructor(readonly bar: TypeOf<Bar>) {}

  id = () => 'foo'

  test(): string {
    return `foo-${this.bar.id()}`
  }
}
