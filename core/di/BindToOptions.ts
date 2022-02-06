import { notNil } from '../preconditions/notNil.js'
import { Binding } from './Binding.js'
import { DI } from './DI.js'
import { Scopes } from './Scopes.js'
import { Token } from './Token.js'

export class BindToOptions<T> {
  constructor(private readonly di: DI, private readonly token: Token<T>, private readonly binding: Binding<T>) {}

  as(lifecycle: string | symbol): BindToOptions<T> {
    notNil(lifecycle)

    this.binding.scopeId = lifecycle
    this.di.configureBinding(this.token, this.binding)

    return this
  }

  singleton(): void {
    this.binding.scopeId = Scopes.SINGLETON
    this.di.configureBinding(this.token, this.binding)
  }

  transient(): void {
    this.binding.scopeId = Scopes.TRANSIENT
    this.di.configureBinding(this.token, this.binding)
  }

  containerScoped(): void {
    this.binding.scopeId = Scopes.CONTAINER
    this.di.configureBinding(this.token, this.binding)
  }

  resolutionScoped(): void {
    this.binding.scopeId = Scopes.RESOLUTION_CONTEXT
    this.di.configureBinding(this.token, this.binding)
  }
}
