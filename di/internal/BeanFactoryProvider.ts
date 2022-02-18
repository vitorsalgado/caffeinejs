import { ConfigurationProviderOptions } from '../decorators/ConfigurationProviderOptions.js'
import { LocalResolutions } from '../LocalResolutions.js'
import { Resolver } from '../Resolver.js'
import { Provider } from '../Provider.js'
import { Ctor } from './types/Ctor.js'
import { ResolutionContext } from './ResolutionContext.js'

export class BeanFactoryProvider<T> implements Provider<T> {
  constructor(
    private readonly target: Ctor,
    private readonly method: string | symbol,
    private readonly options: ConfigurationProviderOptions
  ) {}

  provide(ctx: ResolutionContext): T {
    const clazz = ctx.di.get<{ [key: symbol | string]: (...args: unknown[]) => T }>(this.target, ctx.localResolutions)
    const deps = this.options.dependencies.map((dep, index) =>
      Resolver.resolveParam(ctx.di, this.options.token, dep, index, ctx.localResolutions || LocalResolutions.INSTANCE)
    )

    return clazz[this.method](...deps)
  }
}
