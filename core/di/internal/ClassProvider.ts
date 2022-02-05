import { isNil } from '../../checks/isNil.js'
import { Ctor } from '../../types/Ctor.js'
import { DecoratedInjectables } from '../DecoratedInjectables.js'
import { DeferredCtor } from '../DeferredCtor.js'
import { NoResolutionForTokenError } from '../errors.js'
import { CircularReferenceError } from '../errors.js'
import { UnresolvableConstructorArguments } from '../errors.js'
import { TypeNotRegisteredForInjectionError } from '../errors.js'
import { ResolutionContext } from '../ResolutionContext.js'
import { TokenSpec } from '../Token.js'
import { ProviderContext } from './Provider.js'
import { Provider } from './Provider.js'

export class ClassProvider<T = any> extends Provider<T> {
  constructor(private readonly clazz: Ctor<T> | DeferredCtor<T>) {
    super()
  }

  provide(ctx: ProviderContext): T {
    return this.newClassInstance(ctx, this.clazz, ctx.resolutionContext)
  }

  private newClassInstance<T>(ctx: ProviderContext, ctor: Ctor<T> | DeferredCtor<T>, context: ResolutionContext): T {
    if (ctor instanceof DeferredCtor) {
      return ctor.createProxy(target => ctx.di.get(target, context))
    }

    const type = DecoratedInjectables.instance().get(ctor)

    if (!type) {
      throw new TypeNotRegisteredForInjectionError(ctor)
    }

    const deps = type.dependencies.map(dep => ClassProvider.resolveParam(ctx, ctor, dep, context))

    if (deps.length === 0) {
      if (ctor.length === 0) {
        return new ctor()
      } else {
        throw new UnresolvableConstructorArguments(ctor)
      }
    }

    return new ctor(...deps)
  }

  private static resolveParam<T>(
    ctx: ProviderContext,
    ctor: Ctor<T>,
    dep: TokenSpec<T>,
    context: ResolutionContext
  ): T {
    if (isNil(dep.token) && isNil(dep.tokenType)) {
      throw new CircularReferenceError(ctor)
    }

    let resolution

    if (dep.multiple) {
      resolution = ctx.di.getMany(dep.token, context)
    } else {
      resolution = ctx.di.get(dep.token, context)
    }

    if (isNil(resolution)) {
      const byType = ctx.di.findDefinitionBy(dep.tokenType)

      if (byType) {
        resolution = ctx.di.resolveBinding(dep.token, byType, context)
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
