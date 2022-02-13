import { InvalidBindingError } from './DiError.js'
import { Identifier } from './Identifier.js'
import { notNil } from './utils/notNil.js'
import { Binding } from './Binding.js'
import { DI } from './DI.js'
import { Scopes } from './Scopes.js'
import { Token } from './Token.js'

export class BindToOptions<T> {
  constructor(private readonly di: DI, private readonly token: Token<T>, private readonly binding: Binding<T>) {}

  as(scopeId: string | symbol): BindToOptions<T> {
    notNil(scopeId)

    if (!DI.hasScope(scopeId)) {
      throw new InvalidBindingError(``)
    }

    this.binding.scopeId = scopeId
    this.di.configureBinding(this.token, this.binding)

    return this
  }

  qualifiers(...names: Identifier[]): BindToOptions<T> {
    notNil(names)

    this.binding.names = names
    this.di.configureBinding(this.token, this.binding)

    return this
  }

  lazy(lazy = true): BindToOptions<T> {
    notNil(lazy)

    this.binding.lazy = lazy
    this.di.configureBinding(this.token, this.binding)

    return this
  }

  singletonScoped(): void {
    this.binding.scopeId = Scopes.SINGLETON
    this.di.configureBinding(this.token, this.binding)
  }

  transientScoped(): void {
    this.binding.scopeId = Scopes.TRANSIENT
    this.di.configureBinding(this.token, this.binding)
  }

  containerScoped(): void {
    this.binding.scopeId = Scopes.CONTAINER
    this.di.configureBinding(this.token, this.binding)
  }

  resolutionContextScoped(): void {
    this.binding.scopeId = Scopes.RESOLUTION_CONTEXT
    this.di.configureBinding(this.token, this.binding)
  }
}
