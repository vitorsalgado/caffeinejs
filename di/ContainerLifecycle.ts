import { Token } from './Token.js'
import { Binding } from './Binding.js'

export interface ContainerLifecycle {
  onBinding(token: Token, binding: Binding): void

  onBound(token: Token, binding: Binding): void

  onNotBound(token: Token, binding: Binding): void
}
