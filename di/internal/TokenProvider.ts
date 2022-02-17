import { Token } from '../Token.js'
import { ProviderContext } from '../Provider.js'
import { Provider } from '../Provider.js'

export class TokenProvider<T> implements Provider<T> {
  constructor(private readonly token: Token<T>) {}

  provide(ctx: ProviderContext): T {
    return ctx.di.get(this.token, ctx.resolutionContext)
  }
}
