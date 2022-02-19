import { Token } from '../../Token.js'
import { Provider } from '../../Provider.js'
import { ResolutionContext } from '../../ResolutionContext.js'

export class TokenProvider<T> implements Provider<T> {
  constructor(private readonly token: Token<T>) {}

  provide(ctx: ResolutionContext): T {
    return ctx.container.get(this.token, ctx.args)
  }
}
