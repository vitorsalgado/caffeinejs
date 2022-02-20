import { Binding } from '../../Binding.js'
import { Scope } from '../../Scope.js'
import { Provider } from '../../Provider.js'
import { tokenStr } from '../../Token.js'
import { LocalResolutions } from '../../LocalResolutions.js'
import { ResolutionContext } from '../../ResolutionContext.js'
import { MissingRequiredProviderArgumentError } from '../errors.js'

export class LocalResolutionScope implements Scope {
  get<T>(ctx: ResolutionContext, unscoped: Provider<T>): T {
    if (ctx.args === undefined) {
      return unscoped.provide(ctx)
    }

    if (!(ctx.args instanceof LocalResolutions)) {
      throw new MissingRequiredProviderArgumentError(
        `Local Resolution Scope: Failed to provide a component for token '${tokenStr(
          ctx.token,
        )}' inside local resolution scope. \n` +
          `Reason: missing argument of type 'LocalResolutions'. \n` +
          `Received: '${typeof ctx.args}'. \n` +
          `Possible Solutions: container.get(token, <Pass an instance of LocalResolutions>)`,
      )
    }

    if (ctx.args.has(ctx.binding)) {
      return ctx.args.get(ctx.binding) as T
    }

    const resolved = unscoped.provide(ctx)

    ctx.args.set(ctx.binding, resolved)

    return resolved
  }

  cachedInstance<T>(_binding: Binding): T | undefined {
    return undefined
  }

  remove(_binding: Binding): void {
    // not needed in this scope
  }
}
