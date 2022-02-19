import { Resolver } from '../../Resolver.js'
import { Provider } from '../../Provider.js'
import { ResolutionContext } from '../../ResolutionContext.js'
import { Ctor } from '../types.js'

export class ClassProvider<T = any> implements Provider<T> {
  constructor(private readonly clazz: Ctor<T>) {}

  provide(ctx: ResolutionContext): T {
    return Resolver.construct(ctx.container, this.clazz, ctx.binding, ctx.args)
  }
}
