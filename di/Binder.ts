import { BinderOptions } from './BinderOptions.js'
import { BindToOptions } from './BinderOptions.js'
import { Provider } from './Provider.js'
import { Token } from './Token.js'
import { isNamedToken } from './Token.js'
import { tokenStr } from './Token.js'
import { Binding } from './Binding.js'
import { check } from './internal/utils/check.js'
import { notNil } from './internal/utils/notNil.js'
import { InvalidBindingError } from './internal/errors.js'
import { ResolutionContext } from './ResolutionContext.js'
import { ClassProvider } from './internal/providers/ClassProvider.js'
import { ValueProvider } from './internal/providers/ValueProvider.js'
import { TokenProvider } from './internal/providers/TokenProvider.js'
import { FactoryProvider } from './internal/providers/FactoryProvider.js'
import { Ctor } from './internal/types.js'
import { Container } from './Container.js'

export interface Binder<T> {
  to(ctor: Ctor<T>): BinderOptions<T>

  toSelf(): BinderOptions<T>

  toValue(value: T): BinderOptions<T>

  toToken(token: Token): BinderOptions<T>

  toFactory(factory: (ctx: ResolutionContext) => T): BinderOptions<T>

  toProvider(provider: Provider<T>): BinderOptions<T>
}

export class BindTo<T> implements Binder<T> {
  constructor(
    private readonly container: Container,
    private readonly token: Token<T>,
    private readonly binding: Binding<T>,
  ) {}

  to(ctor: Ctor<T>): BindToOptions<T> {
    check(typeof ctor === 'function', `Binding .to() parameter must be class reference. Received: ${typeof ctor}`)

    this.binding.rawProvider = new ClassProvider(ctor)
    this.container.configureBinding(this.token, this.binding)

    return new BindToOptions<T>(this.container, this.token, this.binding)
  }

  toSelf(): BindToOptions<T> {
    if (isNamedToken(this.token)) {
      throw new InvalidBindingError(
        '.toSelf() cannot be used when binding key is not a class type. ' + `Current token is: ${tokenStr(this.token)}`,
      )
    }

    return this.to(this.token as Ctor)
  }

  toValue(value: T): BinderOptions<T> {
    this.binding.rawProvider = new ValueProvider(value)
    this.container.configureBinding(this.token, this.binding)

    return new BindToOptions<T>(this.container, this.token, this.binding)
  }

  toToken(token: Token): BinderOptions<T> {
    notNil(token)

    this.binding.rawProvider = new TokenProvider(token)
    this.container.configureBinding(this.token, this.binding)

    return new BindToOptions<T>(this.container, this.token, this.binding)
  }

  toFactory(factory: (ctx: ResolutionContext) => T): BinderOptions<T> {
    check(
      typeof factory === 'function',
      `Binding .toFactory() parameter must be function type. Received: ${typeof factory}`,
    )
    check(
      factory.length <= 1,
      `Binding .toFactory() must receive a function with at most one argument, which is the provider context. Received a function with '${factory.length}' argument(s).`,
    )

    this.binding.rawProvider = new FactoryProvider(factory)
    this.container.configureBinding(this.token, this.binding)

    return new BindToOptions<T>(this.container, this.token, this.binding)
  }

  toProvider(provider: Provider<T>): BinderOptions<T> {
    check(
      typeof provider === 'object' && 'provide' in provider,
      `Binding .toProvider() parameter must be a Provider<T> instance.`,
    )

    this.binding.rawProvider = provider
    this.container.configureBinding(this.token, this.binding)

    return new BindToOptions<T>(this.container, this.token, this.binding)
  }
}
