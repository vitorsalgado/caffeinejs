import { Token } from './Token.js'
import { Binding } from './Binding.js'

export interface FilterContext {
  token: Token
  binding: Binding
}

export type Filter = (ctx: FilterContext) => boolean
