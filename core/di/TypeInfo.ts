import { Binding } from './Binding.js'
import { Identifier } from './Identifier.js'
import { Token } from './Token.js'

export interface TypeInfo {
  namespace: Identifier
  loc: Token
  scopeId: Identifier
  names: Identifier[]
  bindings: Binding[]
  configuration?: boolean
  primary?: boolean
  late?: boolean
  lazy?: boolean
  preDestroy?: Identifier
}
