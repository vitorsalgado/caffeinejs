import { isFn } from './utils/isFn.js'
import { notNil } from './utils/notNil.js'
import { Ctor } from './internal/types/Ctor.js'
import { Binding } from './Binding.js'
import { BindToOptions } from './BindToOptions.js'
import { DI } from './DI.js'
import { ClassProvider } from './internal/ClassProvider.js'
import { FactoryProvider } from './internal/FactoryProvider.js'
import { ProviderContext } from './internal/Provider.js'
import { TokenProvider } from './internal/TokenProvider.js'
import { ValueProvider } from './internal/ValueProvider.js'
import { Scopes } from './Scopes.js'
import { Token } from './Token.js'

//TODO: create interface Binder
export class BindTo<T> {
  constructor(private readonly di: DI, private readonly token: Token<T>, private readonly binding: Binding<T>) {}

  to(ctor: Ctor<T>): BindToOptions<T> {
    notNil(ctor)

    this.binding.rawProvider = new ClassProvider(ctor)
    this.di.configureBinding(this.token, this.binding)

    return new BindToOptions<T>(this.di, this.token, this.binding)
  }

  toSelf(): BindToOptions<T> {
    return this.to(this.token as Ctor)
  }

  toValue(value: T): BindToOptions<T> {
    this.binding.rawProvider = new ValueProvider(value)
    this.binding.scopeId = Scopes.SINGLETON

    this.di.configureBinding(this.token, this.binding)

    return new BindToOptions<T>(this.di, this.token, this.binding)
  }

  toToken(token: string | symbol): BindToOptions<T> {
    notNil(token)

    this.binding.rawProvider = new TokenProvider(token)
    this.di.configureBinding(this.token, this.binding)

    return new BindToOptions<T>(this.di, this.token, this.binding)
  }

  toFactory(factory: (ctx: ProviderContext) => T): BindToOptions<T> {
    notNil(factory)
    isFn(factory)

    this.binding.rawProvider = new FactoryProvider(factory)
    this.binding.scopeId = Scopes.SINGLETON
    this.di.configureBinding(this.token, this.binding)

    return new BindToOptions<T>(this.di, this.token, this.binding)
  }
}
