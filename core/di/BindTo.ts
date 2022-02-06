import { isFn } from '../checks/isFn.js'
import { notNil } from '../preconditions/notNil.js'
import { Ctor } from '../types/Ctor.js'
import { Binding } from './Binding.js'
import { BindToOptions } from './BindToOptions.js'
import { DI } from './DI.js'
import { ClassProvider } from './internal/ClassProvider.js'
import { FactoryProvider } from './internal/FactoryProvider.js'
import { ProviderContext } from './internal/Provider.js'
import { TokenProvider } from './internal/TokenProvider.js'
import { ValueProvider } from './internal/ValueProvider.js'
import { Lifecycle } from './Lifecycle.js'
import { Token } from './Token.js'

export class BindTo<T> {
  constructor(private readonly di: DI, private readonly token: Token<T>, private readonly binding: Binding<T>) {}

  to(ctor: Ctor<T>): BindToOptions<T> {
    notNil(ctor)

    this.binding.provider = new ClassProvider(ctor)
    this.di.register(this.token, this.binding)

    return new BindToOptions<T>(this.di, this.token, this.binding)
  }

  toSelf(): BindToOptions<T> {
    return this.to(this.token as Ctor)
  }

  toValue(value: T): BindToOptions<T> {
    this.binding.provider = new ValueProvider(value)
    this.binding.lifecycle = Lifecycle.SINGLETON

    this.di.register(this.token, this.binding)

    return new BindToOptions<T>(this.di, this.token, this.binding)
  }

  toToken(token: string | symbol): BindToOptions<T> {
    notNil(token)

    this.binding.provider = new TokenProvider(token)
    this.di.register(this.token, this.binding)

    return new BindToOptions<T>(this.di, this.token, this.binding)
  }

  toFactory(factory: (ctx: ProviderContext) => T): BindToOptions<T> {
    notNil(factory)
    isFn(factory)

    this.binding.provider = new FactoryProvider(factory)
    this.binding.lifecycle = Lifecycle.SINGLETON
    this.di.register(this.token, this.binding)

    return new BindToOptions<T>(this.di, this.token, this.binding)
  }
}
