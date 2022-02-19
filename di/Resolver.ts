import { MultiplePrimaryError } from './internal/errors.js'
import { NoUniqueInjectionForTokenError } from './internal/errors.js'
import { NoResolutionForTokenError } from './internal/errors.js'
import { CircularReferenceError } from './internal/errors.js'
import { solutions } from './internal/errors.js'
import { newBinding } from './Binding.js'
import { Binding } from './Binding.js'
import { DeferredCtor } from './internal/DeferredCtor.js'
import { TokenProvider } from './internal/providers/TokenProvider.js'
import { tokenStr } from './Token.js'
import { Token } from './Token.js'
import { TokenSpec } from './Token.js'
import { fmtTokenError } from './internal/utils/errorFmt.js'
import { fmtParamError } from './internal/utils/errorFmt.js'
import { Ctor } from './internal/types.js'
import { Container } from './Container.js'
import { Optional } from './decorators/Optional.js'
import { Defer } from './decorators/Defer.js'
import { Primary } from './decorators/Primary.js'

export namespace Resolver {
  export function resolve<T>(container: Container, token: Token<T>, binding?: Binding<T>, context?: unknown): T {
    if (binding) {
      return binding.scopedProvider.provide({ container, token, binding, args: context }) as T
    }

    if (token instanceof DeferredCtor) {
      return token.createProxy(target => container.get(target, context))
    }

    let resolved: T | undefined

    if (typeof token === 'function') {
      const entries = container.search(
        tk => typeof tk === 'function' && tk.name !== token.name && token.isPrototypeOf(tk)
      )

      if (entries.length === 1) {
        const tk = entries[0].token
        resolved = container.get<T>(tk, context)

        container.configureBinding(token, newBinding({ rawProvider: new TokenProvider(tk) }))
      } else if (entries.length > 1) {
        const primaries = entries.filter(x => x.binding.primary)

        if (primaries.length > 1) {
          throw new MultiplePrimaryError(
            `Found multiple 'primary' bindings for token '${tokenStr(token)}'. \n` +
              `Check the following bindings: ${primaries.map(x => tokenStr(x.token)).join(', ')}. \n` +
              `Only one component per token can be decorated with @${Primary.name}`
          )
        }

        if (primaries.length === 1) {
          const primary = primaries[0]

          resolved = container.get<T>(primary.token, context)

          container.configureBinding(token, newBinding({ ...primary, rawProvider: new TokenProvider(primary.token) }))
        } else {
          throw new NoUniqueInjectionForTokenError(token)
        }
      }
    }

    return resolved as T
  }

  export function construct<T>(container: Container, ctor: Ctor<T>, binding: Binding, context: unknown): T {
    return new ctor(...binding.injections.map((dep, index) => resolveParam(container, ctor, dep, index, context)))
  }

  export function resolveParam<T>(
    container: Container,
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
          `This could mean that the component '${tokenStr(target)}' has a circular reference.` +
          solutions(
            `- If this was intentional, make sure to decorate your circular dependency with @${Defer.name} and use the type TypeOf<> to avoid TS errors on compilation.`
          )
      )
    }

    let resolution: unknown

    if (dep.multiple) {
      resolution = container.getMany(dep.token, context)
    } else {
      resolution = container.get(dep.token, context)
    }

    if (resolution !== undefined && resolution !== null) {
      return resolution as T
    }

    if (dep.optional) {
      return undefined as unknown as T
    }

    throw new NoResolutionForTokenError(
      `Unable to resolve ${fmtParamError(target, indexOrProp)} with token ${fmtTokenError(dep)}.` +
        solutions(
          `- Check if the type '${tokenStr(target)}' has all its dependencies correctly registered`,
          `- If this dependency is optional and can be undefined, decorate it with @${Optional.name}`
        )
    )
  }
}
