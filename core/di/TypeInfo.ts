import { Provider } from './Provider.js'
import { Scope } from './Scope.js'
import { TokenSpec } from './Token.js'

export interface TypeInfo {
  dependencies: TokenSpec<unknown>[]
  namespace: string | symbol
  scope: Scope
  qualifiers: (string | symbol)[]
  provider?: Provider<unknown>
  primary?: boolean
}

export function newTypeInfo(initial?: Partial<TypeInfo>): TypeInfo {
  return {
    dependencies: [],
    scope: Scope.SINGLETON,
    namespace: '',
    qualifiers: [],
    ...initial
  }
}
