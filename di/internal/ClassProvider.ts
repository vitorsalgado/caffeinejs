import { Resolver } from '../Resolver.js'
import { Provider } from '../Provider.js'
import { Ctor } from './types/Ctor.js'
import { ResolutionContext } from './ResolutionContext.js'

export class ClassProvider<T = any> implements Provider<T> {
  constructor(private readonly clazz: Ctor<T>) {}

  provide(ctx: ResolutionContext): T {
    return Resolver.construct(ctx.di, this.clazz, ctx.binding, ctx.localResolutions)
  }
}
