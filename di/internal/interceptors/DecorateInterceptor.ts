import { ResolutionContext } from '../../ResolutionContext.js'
import { PostResolutionInterceptor } from '../../PostResolutionInterceptor.js'
import { Resolver } from '../../Resolver.js'
import { Ctor } from '../types.js'
import { Token } from '../../Token.js'
import { tokenStr } from '../../Token.js'
import { isNamedToken } from '../../Token.js'
import { NoUniqueInjectionForTokenError } from '../errors.js'
import { NoResolutionForTokenError } from '../errors.js'
import { solutions } from '../errors.js'
import { InvalidBindingError } from '../errors.js'
import { Injectable } from '../../decorators/Injectable.js'
import { Bean } from '../../decorators/Bean.js'

export class DecorateInterceptor<T> implements PostResolutionInterceptor<T> {
  constructor(private readonly decorator: Token) {}

  intercept(instance: T, ctx: ResolutionContext): T {
    const binding = DecorateInterceptor.uniqueBinding(ctx, this.decorator)
    const decoratees = binding.injections.filter(x => x.decorated)
    const args = []

    if (decoratees.length === 0) {
      throw new InvalidBindingError(
        `Decorator '${tokenStr(this.decorator)}' for '${tokenStr(
          ctx.token,
        )}' must have 1 constructor parameter decorated with '@Decoratee()'`,
      )
    }

    if (decoratees.length > 1) {
      throw new InvalidBindingError(
        `Decorator '${tokenStr(this.decorator)}' for '${tokenStr(ctx.token)}' contains '${
          decoratees.length
        }' parameters decorated with '@Decoratee()'. It must have only 1 constructor parameter as the decoratee. ` +
          solutions(
            `- Check the decorator class '${tokenStr(
              this.decorator,
            )}' constructor and ensure it contains only 1 '@Decoratee()' parameter`,
          ),
      )
    }

    for (let i = 0; i < binding.injections.length; i++) {
      const injection = binding.injections[i]

      if (injection.decorated) {
        args.push(instance)
      } else {
        args.push(Resolver.resolveParam(ctx.container, ctx.token, injection, i, ctx.args))
      }
    }

    if (isNamedToken(this.decorator)) {
      if (typeof binding.type === 'function') {
        return new (binding.type as Ctor)(...args)
      } else {
        throw new NoResolutionForTokenError(
          `Unable to resolve decorator '${tokenStr(this.decorator)}' for class '${tokenStr(
            ctx.token,
          )}'. Reason: Couldn't find a valid decorator class to construct. Decorator token is named and the binding type is: '${
            binding.type
          }' of type '${typeof binding.type}'` +
            solutions(
              `- Check if the named injection token '${tokenStr(
                this.decorator,
              )}' is pointing to a valid decorator class and the decorator has the same structure of '${tokenStr(
                ctx.token,
              )}'`,
            ),
        )
      }
    } else {
      return new (this.decorator as Ctor)(...args)
    }
  }

  private static uniqueBinding(ctx: ResolutionContext, token: Token) {
    const bindings = ctx.container.getBindings(token)

    if (bindings.length === 0) {
      throw new NoResolutionForTokenError(
        `Unable to resolve decorator '${tokenStr(token)}' for class '${tokenStr(
          ctx.token,
        )}'. Reason: Found 0 registrations. ` +
          solutions(
            `- Check if the decorator '${tokenStr(token)}' is correctly decorated with '@${Injectable.name}' or '@${
              Bean.name
            }'`,
            `- Check if the decorator is correctly imported in any place before resolution`,
          ),
      )
    }

    if (bindings.length > 1) {
      const primary = bindings.find(x => x.primary)

      if (primary) {
        return primary
      } else {
        throw new NoUniqueInjectionForTokenError(token)
      }
    } else {
      return bindings[0]
    }
  }
}
