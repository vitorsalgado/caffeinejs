import { DI } from './DI.js'
import { Token } from './Token.js'
import { Binding } from './Binding.js'

export interface ResolutionContext {
  di: DI
  token: Token
  binding: Binding
  args?: unknown
}
