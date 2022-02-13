import { InvalidBindingError } from './DiError.js'
import { Identifier } from './Identifier.js'
import { Provider } from './internal/Provider.js'
import { tokenStr } from './Token.js'
import { isNamedToken } from './Token.js'
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
import { Token } from './Token.js'

//TODO: create interface Binder
export class BindTo<T> {
  constructor(private readonly di: DI, private readonly token: Token<T>, private readonly binding: Binding<T>) {}

  to(ctor: Ctor<T>): BindToOptions<T> {
    notNil(ctor)
    isFn(ctor)

    this.binding.rawProvider = new ClassProvider(ctor)
    this.di.configureBinding(this.token, this.binding)

    return new BindToOptions<T>(this.di, this.token, this.binding)
  }

  toSelf(): BindToOptions<T> {
    if (isNamedToken(this.token)) {
      throw new InvalidBindingError(
        '.toSelf() cannot be used when binding key is not a class type. ' + `Current token is: ${tokenStr(this.token)}`
      )
    }

    return this.to(this.token as Ctor)
  }

  toValue(value: T): BindToOptions<T> {
    this.binding.rawProvider = new ValueProvider(value)
    this.di.configureBinding(this.token, this.binding)

    return new BindToOptions<T>(this.di, this.token, this.binding)
  }

  toToken(token: Identifier): BindToOptions<T> {
    notNil(token)

    this.binding.rawProvider = new TokenProvider(token)
    this.di.configureBinding(this.token, this.binding)

    return new BindToOptions<T>(this.di, this.token, this.binding)
  }

  toFactory(factory: (ctx: ProviderContext) => T): BindToOptions<T> {
    notNil(factory)
    isFn(factory)

    this.binding.rawProvider = new FactoryProvider(factory)
    this.di.configureBinding(this.token, this.binding)

    return new BindToOptions<T>(this.di, this.token, this.binding)
  }

  toProvider(provider: Provider<T>): BindToOptions<T> {
    notNil(provider)

    this.binding.rawProvider = provider
    this.di.configureBinding(this.token, this.binding)

    return new BindToOptions<T>(this.di, this.token, this.binding)
  }
}
