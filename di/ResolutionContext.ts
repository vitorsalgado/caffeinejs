import { Token } from './Token.js'
import { Binding } from './Binding.js'
import { Container } from './Container.js'

export interface ResolutionContext<A = unknown> {
  container: Container
  token: Token
  binding: Binding
  args?: A
}
