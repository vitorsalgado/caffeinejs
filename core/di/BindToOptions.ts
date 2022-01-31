import { notNil } from '../preconditions/notNil.js'
import { Binding } from './Binding.js'
import { Lifecycle } from './Lifecycle.js'
import { Token } from './Token.js'

export class BindToOptions<T> {
  constructor(private readonly token: Token<T>, private readonly typeInfo: Binding<T>) {}

  as(lifecycle: Lifecycle): BindToOptions<T> {
    notNil(lifecycle)

    this.typeInfo.lifecycle = lifecycle
    return this
  }

  singleton(): void {
    this.typeInfo.lifecycle = Lifecycle.SINGLETON
  }

  transient(): void {
    this.typeInfo.lifecycle = Lifecycle.TRANSIENT
  }

  containerScoped(): void {
    this.typeInfo.lifecycle = Lifecycle.CONTAINER
  }

  resolutionScoped(): void {
    this.typeInfo.lifecycle = Lifecycle.RESOLUTION_CONTEXT
  }
}
