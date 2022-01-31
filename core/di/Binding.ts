import { Lifecycle } from './Lifecycle.js'
import { Provider } from './Provider.js'
import { TokenSpec } from './Token.js'

export class Binding<T = any> {
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

  static newBinding<T>(initial: Partial<Binding<T>> = {}): Binding<T> {
    return new Binding(
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
}
