import { BinderOptions } from './BinderOptions.js'
import { Identifier } from './Identifier.js'
import { Provider } from './internal/Provider.js'
import { ProviderContext } from './internal/Provider.js'
import { Ctor } from './internal/types/Ctor.js'

export interface Binder<T> {
  to(ctor: Ctor<T>): BinderOptions<T>

  toSelf(): BinderOptions<T>

  toValue(value: T): BinderOptions<T>

  toToken(token: Identifier): BinderOptions<T>

  toFactory(factory: (ctx: ProviderContext) => T): BinderOptions<T>

  toProvider(provider: Provider<T>): BinderOptions<T>
}
