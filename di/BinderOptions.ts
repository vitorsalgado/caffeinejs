import { Token } from './Token.js'
import { Binding } from './Binding.js'
import { notNil } from './internal/utils/notNil.js'
import { Lifecycle } from './Lifecycle.js'
import { InvalidBindingError } from './internal/errors.js'
import { Identifier } from './internal/types.js'
import { Container } from './Container.js'
import { DI } from './DI.js'

export interface BinderOptions<T> {
  as(scopeId: Identifier): BinderOptions<T>

  qualifiers(...names: Identifier[]): BinderOptions<T>

  lazy(lazy?: boolean): BinderOptions<T>

  primary(primary?: boolean): BinderOptions<T>

  singletonScoped(): BinderOptions<T>

  transientScoped(): BinderOptions<T>

  containerScoped(): BinderOptions<T>

  localScoped(): BinderOptions<T>

  requestScoped(): BinderOptions<T>

  refreshableScoped(): BinderOptions<T>

  byPassPostProcessors(): BinderOptions<T>
}

export class BindToOptions<T> implements BinderOptions<T> {
  constructor(
    private readonly container: Container,
    private readonly token: Token<T>,
    private readonly binding: Binding<T>,
  ) {}

  as(scopeId: Identifier): BinderOptions<T> {
    notNil(scopeId)

    if (!DI.hasScope(scopeId)) {
      throw new InvalidBindingError(
        `Scope '${String(
          scopeId,
        )}' is not registered! Register the scope using the method 'DI.bindScope()' before using it.`,
      )
    }

    this.binding.scopeId = scopeId
    this.container.configureBinding(this.token, this.binding)

    return this
  }

  qualifiers(...names: Identifier[]): BinderOptions<T> {
    notNil(names)

    this.binding.names = names
    this.container.configureBinding(this.token, this.binding)

    return this
  }

  lazy(lazy = true): BinderOptions<T> {
    this.binding.lazy = lazy
    this.container.configureBinding(this.token, this.binding)

    return this
  }

  primary(primary = true): BinderOptions<T> {
    this.binding.primary = primary
    this.container.configureBinding(this.token, this.binding)

    return this
  }

  singletonScoped(): BinderOptions<T> {
    this.binding.scopeId = Lifecycle.SINGLETON
    this.container.configureBinding(this.token, this.binding)

    return this
  }

  transientScoped(): BinderOptions<T> {
    this.binding.scopeId = Lifecycle.TRANSIENT
    this.container.configureBinding(this.token, this.binding)

    return this
  }

  containerScoped(): BinderOptions<T> {
    this.binding.scopeId = Lifecycle.CONTAINER
    this.container.configureBinding(this.token, this.binding)

    return this
  }

  localScoped(): BinderOptions<T> {
    this.binding.scopeId = Lifecycle.LOCAL_RESOLUTION
    this.container.configureBinding(this.token, this.binding)

    return this
  }

  refreshableScoped(): BinderOptions<T> {
    this.binding.scopeId = Lifecycle.REFRESH
    this.container.configureBinding(this.token, this.binding)

    return this
  }

  requestScoped(): BinderOptions<T> {
    this.binding.scopeId = Lifecycle.REQUEST
    this.container.configureBinding(this.token, this.binding)

    return this
  }

  byPassPostProcessors(): BinderOptions<T> {
    this.binding.byPassPostProcessors = true
    this.container.configureBinding(this.token, this.binding)

    return this
  }
}
