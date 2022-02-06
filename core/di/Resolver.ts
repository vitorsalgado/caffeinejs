import { isNil } from '../checks/isNil.js'
import { Ctor } from '../types/Ctor.js'
import { newBinding } from './Binding.js'
import { Binding } from './Binding.js'
import { DecoratedInjectables } from './DecoratedInjectables.js'
import { DeferredCtor } from './DeferredCtor.js'
import { DI } from './DI.js'
import { NoUniqueInjectionForTokenError } from './DiError.js'
import { TypeNotRegisteredForInjectionError } from './DiError.js'
import { UnresolvableConstructorArguments } from './DiError.js'
import { NoResolutionForTokenError } from './DiError.js'
import { CircularReferenceError } from './DiError.js'
import { TokenProvider } from './internal/TokenProvider.js'
import { ResolutionContext } from './ResolutionContext.js'
import { tokenStr } from './Token.js'
import { Token } from './Token.js'
import { TokenSpec } from './Token.js'

export namespace Resolver {
  export function resolve<T>(di: DI, token: Token<T>, binding: Binding<T> | undefined, context: ResolutionContext): T {
    if (binding) {
      if (!isNil(binding.instance)) {
        return binding.instance as T
      }

      return binding.scopedProvider.provide({ di, token, binding, resolutionContext: context }) as T
    }

    let resolved: T | undefined

    if (token instanceof DeferredCtor) {
      resolved = construct<T>(di, token, context)
    }

    if (typeof token === 'function') {
      const entries = di.search(tk => typeof tk === 'function' && tk.name !== token.name && token.isPrototypeOf(tk))

      if (entries.length === 1) {
        const tk = entries[0].token
        resolved = di.get<T>(tk as Token<T>, context)

        di.configureBinding(token, newBinding({ provider: new TokenProvider(tk), namespace: di.namespace }))
      } else if (entries.length > 1) {
        const primary = entries.find(x => x.binding.primary)

        if (primary) {
          resolved = di.get<T>(primary.token as Token<T>, context)

          di.configureBinding(token, newBinding({ ...primary, provider: new TokenProvider(primary.token) }))
        } else {
          throw new NoUniqueInjectionForTokenError(token)
        }
      }
    }

    return resolved as T
  }

  export function construct<T>(di: DI, ctor: Ctor<T> | DeferredCtor<T>, context: ResolutionContext): T {
    if (ctor instanceof DeferredCtor) {
      return ctor.createProxy(target => di.get(target, context))
    }

    const type = DecoratedInjectables.instance().get(ctor)

    if (!type) {
      throw new TypeNotRegisteredForInjectionError(ctor)
    }

    const deps = type.dependencies.map(dep => resolveParam(di, ctor, dep, context))

    if (deps.length === 0) {
      if (ctor.length === 0) {
        return new ctor()
      } else {
        throw new UnresolvableConstructorArguments(ctor)
      }
    }

    return new ctor(...deps)
  }

  export function resolveParam<T>(di: DI, target: Token<T>, dep: TokenSpec<T>, context: ResolutionContext): T {
    if (isNil(dep.token) && isNil(dep.tokenType)) {
      throw new CircularReferenceError(
        `Attempt to resolve a undefined injection token. This could mean that the component ${tokenStr(
          target
        )} has a ` +
          'circular reference. If this was intentional, make sure to decorate your circular constructor/provider parameters with @Defer to correctly resolve ' +
          'its dependencies'
      )
    }

    let resolution

    if (dep.multiple) {
      resolution = di.getMany(dep.token, context)
    } else {
      resolution = di.get(dep.token, context)
    }

    if (isNil(resolution)) {
      const byType = di.searchBy(dep.tokenType)

      if (byType) {
        resolution = resolve(di, dep.token, byType, context)

        if (!isNil(resolution)) {
          di.configureBinding(dep.token, byType)
          return resolution
        }
      }
    }

    if (!isNil(resolution)) {
      return resolution
    }

    if (dep.optional) {
      return null as unknown as T
    }

    throw new NoResolutionForTokenError(dep)
  }
}
