import { Binder } from './Binder.js'
import { BinderOptions } from './BinderOptions.js'
import { Binding } from './Binding.js'
import { BindToOptions } from './BindToOptions.js'
import { DI } from './DI.js'
import { InvalidBindingError } from './internal/DiError.js'
import { Identifier } from './internal/types/Identifier.js'
import { ClassProvider } from './internal/ClassProvider.js'
import { FactoryProvider } from './internal/FactoryProvider.js'
import { Provider } from './Provider.js'
import { TokenProvider } from './internal/TokenProvider.js'
import { Ctor } from './internal/types/Ctor.js'
import { ValueProvider } from './internal/ValueProvider.js'
import { tokenStr } from './Token.js'
import { isNamedToken } from './Token.js'
import { Token } from './Token.js'
import { check } from './internal/utils/check.js'
import { notNil } from './internal/utils/notNil.js'
import { ResolutionContext } from './internal/index.js'

export class BindTo<T> implements Binder<T> {
  constructor(private readonly di: DI, private readonly token: Token<T>, private readonly binding: Binding<T>) {}

  to(ctor: Ctor<T>): BindToOptions<T> {
    check(typeof ctor === 'function', `Binding .to() parameter must be class reference. Received: ${typeof ctor}`)

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

  toValue(value: T): BinderOptions<T> {
    this.binding.rawProvider = new ValueProvider(value)
    this.di.configureBinding(this.token, this.binding)

    return new BindToOptions<T>(this.di, this.token, this.binding)
  }

  toToken(token: Identifier): BinderOptions<T> {
    notNil(token)

    this.binding.rawProvider = new TokenProvider(token)
    this.di.configureBinding(this.token, this.binding)

    return new BindToOptions<T>(this.di, this.token, this.binding)
  }

  toFactory(factory: (ctx: ResolutionContext) => T): BinderOptions<T> {
    check(
      typeof factory === 'function',
      `Binding .toFactory() parameter must be function type. Received: ${typeof factory}`
    )
    check(
      factory.length <= 1,
      `Binding .toFactory() must receive a function with at most one argument, which is the provider context. Received a function with '${factory.length}' argument(s).`
    )

    this.binding.rawProvider = new FactoryProvider(factory)
    this.di.configureBinding(this.token, this.binding)

    return new BindToOptions<T>(this.di, this.token, this.binding)
  }

  toProvider(provider: Provider<T>): BinderOptions<T> {
    check(
      typeof provider === 'object' && 'provide' in provider,
      `Binding .toProvider() parameter must be a Provider<T> instance.`
    )

    this.binding.rawProvider = provider
    this.di.configureBinding(this.token, this.binding)

    return new BindToOptions<T>(this.di, this.token, this.binding)
  }
}
