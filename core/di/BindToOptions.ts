import { notNil } from '../preconditions/notNil.js'
import { Binding } from './Binding.js'
import { DI } from './DI.js'
import { Lifecycle } from './Lifecycle.js'
import { Token } from './Token.js'

export class BindToOptions<T> {
  constructor(private readonly di: DI, private readonly token: Token<T>, private readonly binding: Binding<T>) {}

  as(lifecycle: string | symbol): BindToOptions<T> {
    notNil(lifecycle)

    this.binding.lifecycle = lifecycle
    this.di.registerBinding(this.token, this.binding)

    return this
  }

  singleton(): void {
    this.binding.lifecycle = Lifecycle.SINGLETON
    this.di.registerBinding(this.token, this.binding)
  }

  transient(): void {
    this.binding.lifecycle = Lifecycle.TRANSIENT
    this.di.registerBinding(this.token, this.binding)
  }

  containerScoped(): void {
    this.binding.lifecycle = Lifecycle.CONTAINER
    this.di.registerBinding(this.token, this.binding)
  }

  resolutionScoped(): void {
    this.binding.lifecycle = Lifecycle.RESOLUTION_CONTEXT
    this.di.registerBinding(this.token, this.binding)
  }
}
