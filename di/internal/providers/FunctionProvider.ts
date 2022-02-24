import { Provider } from '../../Provider.js'
import { ResolutionContext } from '../../ResolutionContext.js'
import { Resolver } from '../../Resolver.js'

export class FunctionProvider implements Provider {
  constructor(private readonly fn: (...args: unknown[]) => unknown) {}

  provide(ctx: ResolutionContext): unknown {
    return this.fn(
      ...ctx.binding.injections.map((dep, index) =>
        Resolver.resolveParam(ctx.container, this.fn, dep, index, ctx.args),
      ),
    )
  }
}
