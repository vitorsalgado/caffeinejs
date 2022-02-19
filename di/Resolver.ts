import { MultiplePrimaryError } from './internal/DiError.js'
import { NoUniqueInjectionForTokenError } from './internal/DiError.js'
import { NoResolutionForTokenError } from './internal/DiError.js'
import { CircularReferenceError } from './internal/DiError.js'
import { Ctor } from './internal/types/Ctor.js'
import { newBinding } from './Binding.js'
import { Binding } from './Binding.js'
import { DeferredCtor } from './internal/DeferredCtor.js'
import { DI } from './DI.js'
import { TokenProvider } from './internal/TokenProvider.js'
import { tokenStr } from './Token.js'
import { Token } from './Token.js'
import { TokenSpec } from './Token.js'
import { fmtTokenError } from './internal/utils/errorFmt.js'
import { fmtParamError } from './internal/utils/errorFmt.js'

export namespace Resolver {
  export function resolve<T>(di: DI, token: Token<T>, binding?: Binding<T>, context?: unknown): T {
    if (binding) {
      return binding.scopedProvider.provide({ di, token, binding, args: context }) as T
    }

    if (token instanceof DeferredCtor) {
      return token.createProxy(target => di.get(target, context))
    }

    let resolved: T | undefined

    if (typeof token === 'function') {
      const entries = di.search(tk => typeof tk === 'function' && tk.name !== token.name && token.isPrototypeOf(tk))

      if (entries.length === 1) {
        const tk = entries[0].token
        resolved = di.get<T>(tk, context)

        di.configureBinding(token, newBinding({ rawProvider: new TokenProvider(tk) }))
      } else if (entries.length > 1) {
        const primaries = entries.filter(x => x.binding.primary)

        if (primaries.length > 1) {
          throw new MultiplePrimaryError(
            `Found multiple primary bindings for token '${tokenStr(token)}'. ` +
              `Check the following bindings: ${primaries.map(x => tokenStr(x.token)).join(', ')}`
          )
        }

        if (primaries.length === 1) {
          const primary = primaries[0]

          resolved = di.get<T>(primary.token, context)

          di.configureBinding(token, newBinding({ ...primary, rawProvider: new TokenProvider(primary.token) }))
        } else {
          throw new NoUniqueInjectionForTokenError(token)
        }
      }
    }

    return resolved as T
  }

  export function construct<T>(di: DI, ctor: Ctor<T>, binding: Binding, context: unknown): T {
    return new ctor(...binding.injections.map((dep, index) => resolveParam(di, ctor, dep, index, context)))
  }

  export function resolveParam<T>(
    di: DI,
    target: Token<T>,
    dep: TokenSpec<T>,
    indexOrProp: number | string | symbol,
    context?: unknown
  ): T {
    if (dep.token === undefined || dep.token === null) {
      throw new CircularReferenceError(
        `Cannot resolve ${fmtParamError(target, indexOrProp)} from type '${tokenStr(
          target
        )}' because the injection token is undefined.\n` +
          `This could mean that the component '${tokenStr(target)}' has a circular reference.\n` +
          'If this was intentional, make sure to decorate your circular constructor/provider parameters with @Defer to correctly resolve ' +
          'its dependencies.'
      )
    }

    let resolution: unknown

    if (dep.multiple) {
      resolution = di.getMany(dep.token, context)
    } else {
      resolution = di.get(dep.token, context)
    }

    if (resolution !== undefined && resolution !== null) {
      return resolution as T
    }

    if (dep.optional) {
      return undefined as unknown as T
    }

    throw new NoResolutionForTokenError(
      dep,
      `Cannot resolve ${fmtParamError(target, indexOrProp)} with token ${fmtTokenError(dep)}.\n` +
        `Check if the type ${tokenStr(target)} has all its dependencies correctly registered.`
    )
  }
}
