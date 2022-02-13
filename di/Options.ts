import { Identifier } from './Identifier.js'
import { Scopes } from './Scopes.js'

export interface Options {
  namespace: Identifier
  scopeId: Identifier
  lazy?: boolean
  lateBind?: boolean
}

export const InitialOptions: Options = {
  namespace: '',
  scopeId: Scopes.SINGLETON
}
