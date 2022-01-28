import { Lifecycle } from './Lifecycle.js'
import { Token } from './Token.js'
import { TypeInfo } from './TypeInfo.js'

export class BindToOptions<T> {
  constructor(private readonly token: Token<T>, private readonly typeInfo: TypeInfo<T>) {}

  as(lifecycle: Lifecycle): BindToOptions<T> {
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
    this.typeInfo.lifecycle = Lifecycle.RESOLUTION
  }
}
