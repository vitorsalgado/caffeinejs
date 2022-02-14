import { BinderOptions } from './BinderOptions.js'
import { Binding } from './Binding.js'
import { DI } from './DI.js'
import { InvalidBindingError } from './DiError.js'
import { Identifier } from './Identifier.js'
import { Lifecycle } from './Lifecycle.js'
import { Token } from './Token.js'
import { notNil } from './utils/notNil.js'

export class BindToOptions<T> implements BinderOptions<T> {
  constructor(private readonly di: DI, private readonly token: Token<T>, private readonly binding: Binding<T>) {}

  as(scopeId: Identifier): BinderOptions<T> {
    notNil(scopeId)

    if (!DI.hasScope(scopeId)) {
      throw new InvalidBindingError(``)
    }

    this.binding.scopeId = scopeId
    this.di.configureBinding(this.token, this.binding)

    return this
  }

  qualifiers(...names: Identifier[]): BinderOptions<T> {
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
    this.binding.scopeId = Lifecycle.SINGLETON
    this.di.configureBinding(this.token, this.binding)
  }

  transientScoped(): void {
    this.binding.scopeId = Lifecycle.TRANSIENT
    this.di.configureBinding(this.token, this.binding)
  }

  containerScoped(): void {
    this.binding.scopeId = Lifecycle.CONTAINER
    this.di.configureBinding(this.token, this.binding)
  }

  resolutionContextScoped(): void {
    this.binding.scopeId = Lifecycle.RESOLUTION_CONTEXT
    this.di.configureBinding(this.token, this.binding)
  }
}
