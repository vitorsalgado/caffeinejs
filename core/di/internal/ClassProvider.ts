import { Ctor } from '../../types/Ctor.js'
import { DeferredCtor } from '../DeferredCtor.js'
import { Resolver } from '../Resolver.js'
import { ProviderContext } from './Provider.js'
import { Provider } from './Provider.js'

export class ClassProvider<T = any> extends Provider<T> {
  constructor(private readonly clazz: Ctor<T> | DeferredCtor<T>) {
    super()
  }

  provide(ctx: ProviderContext): T {
    return Resolver.construct(ctx.di, this.clazz, ctx.resolutionContext)
  }
}
