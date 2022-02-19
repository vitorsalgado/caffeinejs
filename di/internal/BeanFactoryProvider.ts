import { Resolver } from '../Resolver.js'
import { Provider } from '../Provider.js'
import { ConfigurationProviderOptions } from '../decorators/ConfigurationProviderOptions.js'
import { ResolutionContext } from '../ResolutionContext.js'
import { Ctor } from './types/Ctor.js'

export class BeanFactoryProvider<T> implements Provider<T> {
  constructor(
    private readonly target: Ctor,
    private readonly method: string | symbol,
    private readonly options: ConfigurationProviderOptions
  ) {}

  provide(ctx: ResolutionContext): T {
    const clazz = ctx.di.get<{ [key: symbol | string]: (...args: unknown[]) => T }>(this.target, ctx.args)
    const deps = this.options.dependencies.map((dep, index) =>
      Resolver.resolveParam(ctx.di, this.options.token, dep, index, ctx.args)
    )

    return clazz[this.method](...deps)
  }
}
