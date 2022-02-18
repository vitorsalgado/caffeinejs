import { BinderOptions } from './BinderOptions.js'
import { Identifier } from './internal/types/Identifier.js'
import { Provider } from './Provider.js'
import { Ctor } from './internal/types/Ctor.js'
import { ResolutionContext } from './internal/index.js'

export interface Binder<T> {
  to(ctor: Ctor<T>): BinderOptions<T>

  toSelf(): BinderOptions<T>

  toValue(value: T): BinderOptions<T>

  toToken(token: Identifier): BinderOptions<T>

  toFactory(factory: (ctx: ResolutionContext) => T): BinderOptions<T>

  toProvider(provider: Provider<T>): BinderOptions<T>
}
