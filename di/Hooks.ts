import { Token } from './Token.js'
import { Binding } from './Binding.js'

export interface Hooks {
  onSetup: { token: Token; binding: Binding }

  onBindingRegistered: { token: Token; binding: Binding }

  onBindingNotRegistered: { token: Token; binding: Binding }

  onSetupComplete: {}

  onDisposed: {}
}
