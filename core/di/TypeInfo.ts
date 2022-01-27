import { Provider } from './Provider.js'
import { Lifecycle } from './Lifecycle.js'
import { TokenSpec } from './Token.js'

export interface TypeInfo {
  dependencies: TokenSpec<unknown>[]
  namespace: string | symbol
  scope: Lifecycle
  qualifiers: (string | symbol)[]
  provider?: Provider<unknown>
  primary?: boolean
}

export function newTypeInfo(initial?: Partial<TypeInfo>): TypeInfo {
  return {
    dependencies: [],
    scope: Lifecycle.SINGLETON,
    namespace: '',
    qualifiers: [],
    ...initial
  }
}
