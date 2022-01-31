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
    public late?: boolean,
    public lazy?: boolean
  ) {}

  static newBinding<T>(initial: Partial<Binding<T>> = {}): Binding<T> {
    const lifecycle = initial.lifecycle === undefined ? Lifecycle.SINGLETON : initial.lifecycle
    const lazy =
      initial.lazy === undefined
        ? !(lifecycle === Lifecycle.SINGLETON || lifecycle === Lifecycle.CONTAINER)
        : initial.lazy

    return new Binding(
      initial.dependencies || [],
      initial.namespace || '',
      lifecycle,
      initial.qualifiers || [],
      initial.instance,
      initial.provider,
      initial.primary,
      initial.late,
      lazy
    )
  }
}
