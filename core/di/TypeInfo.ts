import { Lifecycle } from './Lifecycle.js'
import { Provider } from './Provider.js'
import { Resolver } from './Resolver.js'
import { TokenSpec } from './Token.js'

export class TypeInfo<T = unknown> {
  constructor(
    public dependencies: TokenSpec<unknown>[],
    public namespace: string | symbol,
    public lifecycle: Lifecycle,
    public qualifiers: (string | symbol)[],
    public instance?: T,
    public provider?: Provider<T>,
    public primary?: boolean,
    public late?: boolean,
    public resolver?: Resolver<T>
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
