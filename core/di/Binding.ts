import { Provider } from './Provider.js'
import { Scope } from './Scope.js'
import { TokenSpec } from './Token.js'

export class Binding<T> {
  provider!: Provider<T>
  dependencies: TokenSpec<unknown>[] = []
  instance?: T
  primary?: boolean

  constructor(
    public lifecycle: Scope,
    provider?: Provider<T>,
    dependencies: TokenSpec<unknown>[] = [],
    primary = false
  ) {
    this.provider = provider as Provider<T>
    this.dependencies = dependencies
    this.primary = primary
  }
}
