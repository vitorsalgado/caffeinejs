import { Token } from './Token.js'
import { Binding } from './Binding.js'

export interface Filter {
  match(token: Token, binding: Binding): boolean
}
