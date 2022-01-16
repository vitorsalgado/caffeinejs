import { Provider } from './Provider.js'
import { Scope } from './Scope.js'
import { Token } from './Token.js'
import { TokenSpec } from './Token.js'

export interface TypeInfo {
  dependencies: (Token<unknown> | TokenSpec<unknown>)[]
  namespace: string | symbol
  scope: Scope
  qualifiers: (string | symbol)[]
  provider?: Provider<unknown>
  primary?: boolean
  autoInit?: boolean
}

export function newTypeInfo(initial?: Partial<TypeInfo>): TypeInfo {
  return {
    dependencies: [],
    scope: Scope.SINGLETON,
    namespace: '',
    qualifiers: [],
    autoInit: true,
    ...initial
  }
}
