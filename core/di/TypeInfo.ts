import { Lifecycle } from './Lifecycle.js'
import { Provider } from './Provider.js'
import { TokenSpec } from './Token.js'

// export interface ITypeInfo<T = unknown> {
//   dependencies: TokenSpec<unknown>[]
//   namespace: string | symbol
//   scope: Lifecycle
//   qualifiers: (string | symbol)[]
//   instance?: T
//   provider?: Provider<T>
//   primary?: boolean
// }

export class TypeInfo<T = unknown> {
  constructor(
    public dependencies: TokenSpec<unknown>[],
    public namespace: string | symbol,
    public lifecycle: Lifecycle,
    public qualifiers: (string | symbol)[],
    public instance?: T,
    public provider?: Provider<T>,
    public primary?: boolean,
    public late?: boolean
  ) {}
}

export function newTypeInfo<T>(initial: Partial<TypeInfo<T>> = {}): TypeInfo<T> {
  return new TypeInfo(
    initial.dependencies || [],
    initial.namespace || '',
    initial.lifecycle || Lifecycle.SINGLETON,
    initial.qualifiers || [],
    initial.instance,
    initial.provider,
    initial.primary,
    initial.late
  )
}
