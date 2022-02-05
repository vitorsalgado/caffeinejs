import { Binding } from '../Binding.js'
import { DI } from '../DI.js'
import { ResolutionContext } from '../ResolutionContext.js'
import { Token } from '../Token.js'

export interface ProviderContext {
  di: DI
  token: Token
  binding: Binding
  resolutionContext: ResolutionContext
}

export abstract class Provider<T = any> {
  abstract provide(ctx: ProviderContext): T
}
