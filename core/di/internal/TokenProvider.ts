import { Token } from '../Token.js'
import { ProviderContext } from './Provider.js'
import { Provider } from './Provider.js'

export class TokenProvider<T> extends Provider<T> {
  constructor(private readonly token: Token<T>) {
    super()
  }

  provide(ctx: ProviderContext): T {
    return ctx.di.get(this.token, ctx.resolutionContext)
  }
}
