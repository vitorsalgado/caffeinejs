import { Resolver } from '../Resolver.js'
import { Ctor } from './types/Ctor.js'
import { ProviderContext } from './Provider.js'
import { Provider } from './Provider.js'

export class ClassProvider<T = any> implements Provider<T> {
  constructor(private readonly clazz: Ctor<T>) {}

  provide(ctx: ProviderContext): T {
    return Resolver.construct(ctx.di, this.clazz, ctx.binding, ctx.resolutionContext)
  }
}
