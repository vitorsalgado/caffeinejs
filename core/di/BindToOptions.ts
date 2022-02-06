import { notNil } from '../preconditions/notNil.js'
import { Binding } from './Binding.js'
import { DI } from './DI.js'
import { BuiltInLifecycles } from './BuiltInLifecycles.js'
import { Token } from './Token.js'

export class BindToOptions<T> {
  constructor(private readonly di: DI, private readonly token: Token<T>, private readonly binding: Binding<T>) {}

  as(lifecycle: string | symbol): BindToOptions<T> {
    notNil(lifecycle)

    this.binding.lifecycle = lifecycle
    this.di.register(this.token, this.binding)

    return this
  }

  singleton(): void {
    this.binding.lifecycle = BuiltInLifecycles.SINGLETON
    this.di.register(this.token, this.binding)
  }

  transient(): void {
    this.binding.lifecycle = BuiltInLifecycles.TRANSIENT
    this.di.register(this.token, this.binding)
  }

  containerScoped(): void {
    this.binding.lifecycle = BuiltInLifecycles.CONTAINER
    this.di.register(this.token, this.binding)
  }

  resolutionScoped(): void {
    this.binding.lifecycle = BuiltInLifecycles.RESOLUTION_CONTEXT
    this.di.register(this.token, this.binding)
  }
}
