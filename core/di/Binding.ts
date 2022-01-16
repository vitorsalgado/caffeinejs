import { Scope } from './Scope.js'
import { Provider } from './Provider.js'
import { TokenSpec } from './Token.js'
import { Token } from './Token.js'

export class Binding<T> {
  provider!: Provider<T>
  dependencies: (Token<unknown> | TokenSpec<unknown>)[] = []
  instance?: T
  primary?: boolean

  constructor(
    public lifecycle: Scope,
    provider?: Provider<T>,
    dependencies: (Token<unknown> | TokenSpec<unknown>)[] = [],
    primary = false
  ) {
    this.provider = provider as Provider<T>
    this.dependencies = dependencies
    this.primary = primary
  }
}
