import { Identifier } from './Identifier.js'
import { Lifecycle } from './Lifecycle.js'

export interface Options {
  namespace: Identifier
  scopeId: Identifier
  lazy?: boolean
  lateBind?: boolean
}

export const InitialOptions: Options = {
  namespace: '',
  scopeId: Lifecycle.SINGLETON
}
