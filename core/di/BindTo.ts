import { Ctor } from '../types/Ctor.js'
import { BindToOptions } from './BindToOptions.js'
import { Lifecycle } from './Lifecycle.js'
import { ProviderContext } from './Provider.js'
import { Token } from './Token.js'
import { Binding } from './Binding.js'

export class BindTo<T> {
  constructor(private readonly token: Token<T>, private readonly typeInfo: Binding<T>) {}

  to(ctor: Ctor<T>): BindToOptions<T> {
    this.typeInfo.provider = { useClass: ctor }
    return new BindToOptions<T>(this.token, this.typeInfo)
  }

  toSelf(): BindToOptions<T> {
    return this.to(this.token as Ctor)
  }

  toValue(value: T): BindToOptions<T> {
    this.typeInfo.provider = { useValue: value }
    this.typeInfo.lifecycle = Lifecycle.SINGLETON

    return new BindToOptions<T>(this.token, this.typeInfo)
  }

  toFactory(factory: (ctx: ProviderContext<T>) => T): BindToOptions<T> {
    this.typeInfo.provider = { useFactory: factory }
    this.typeInfo.lifecycle = Lifecycle.SINGLETON

    return new BindToOptions<T>(this.token, this.typeInfo)
  }
}
