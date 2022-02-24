import { Provider } from '../../Provider.js'
import { ResolutionContext } from '../../ResolutionContext.js'
import { Resolver } from '../../Resolver.js'
import { Ctor } from '../types.js'

export class BagArgsClassProvider<T> implements Provider<T> {
  constructor(private readonly clazz: Ctor<T>) {}

  provide(ctx: ResolutionContext): T {
    const args = []

    for (let i = 0; i < ctx.binding.injections.length; i++) {
      const injection = ctx.binding.injections[i]

      if (injection.bag) {
        const bag: Record<string | symbol, unknown> = {}

        for (const tokenBag of injection.bag) {
          bag[tokenBag.key] = Resolver.resolveParam(
            ctx.container,
            ctx.token,
            { ...tokenBag, tokenType: tokenBag.token },
            i,
            ctx.args,
          )
        }

        args.push(bag)
      } else {
        args.push(Resolver.resolveParam(ctx.container, ctx.token, injection, i, ctx.args))
      }
    }

    return new this.clazz(...args)
  }
}
