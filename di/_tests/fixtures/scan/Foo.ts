import { Injectable } from '../../../decorators/Injectable.js'
import { Ref1 } from './Ref1.js'

@Injectable()
export class Foo {
  constructor(readonly ref: Ref1) {}
}
