import { isNil } from '../checks/isNil.js'
import { notNil } from '../preconditions/notNil.js'
import { Ctor } from '../types/Ctor.js'
import { BindTo } from './BindTo.js'
import { DecoratedInjectables } from './DecoratedInjectables.js'
import { DeferredCtor } from './DeferredCtor.js'
import { Lifecycle } from './Lifecycle.js'
import { providerFromToken } from './Provider.js'
import { isNamedProvider } from './Provider.js'
import { isFactoryProvider } from './Provider.js'
import { isValueProvider } from './Provider.js'
import { isFunctionProvider } from './Provider.js'
import { isClassProvider } from './Provider.js'
import { Registry, RegistryEntry } from './Registry.js'
import { ResolutionContext } from './ResolutionContext.js'
import { FnResolver } from './Resolver.js'
import { ResolverContext } from './Resolver.js'
import { Resolver } from './Resolver.js'
import { TokenSpec } from './Token.js'
import { isNamedToken, Token } from './Token.js'
import { newTypeInfo, TypeInfo } from './TypeInfo.js'

export class DI {
  private static CUSTOM_RESOLVERS: Map<Token<any>, Resolver<any>> = new Map()
  private readonly _registry: Registry = new Registry()
  private readonly _q: Map<string | symbol, TypeInfo[]> = new Map()

  protected constructor(readonly namespace = '', readonly parent?: DI) {}

  static setup(namespace = '', parent?: DI): DI {
    const di = new DI(namespace, parent)
    di.setup()

    return di
  }

  static configureInjectable<T>(token: Ctor<T> | Function | object, opts?: Partial<TypeInfo>): void {
    const tk = typeof token === 'object' ? token.constructor : token
    const existing = DecoratedInjectables.instance().get(tk as Ctor<T>)
    const options = newTypeInfo({ ...existing, ...opts })

    if (isNil(options.provider)) {
      if (typeof tk === 'function') {
        options.provider = { useClass: tk as Ctor<T> }
      } else if (isNamedToken(tk)) {
        options.provider = { useName: tk }
      }
    }

    if (!options.provider) {
      throw new Error(`Could not set a provider for token: ${String(tk)}`)
    }

    DecoratedInjectables.instance().configure(tk as Ctor<T>, options)
  }

  bind<T>(token: Token<T>): BindTo<T> {
    const t = DecoratedInjectables.instance().get(token as Ctor)
    const type = newTypeInfo(t)

    this.register(token, type)

    return new BindTo<T>(token, type as TypeInfo<T>)
  }

  has<T>(token: Token<T>, checkParent = false): boolean {
    return this._registry.has(token) || (checkParent && (this.parent || false) && this.parent.has(token, true))
  }

  scan(predicate: <T>(token: Token<T>, registration: TypeInfo) => boolean): RegistryEntry[] {
    const result: RegistryEntry[] = []

    for (const [token, registrations] of this._registry.entries()) {
      if (predicate(token, registrations)) {
        result.push({ token, registration: registrations })
      }
    }

    return result
  }

  resolve<T>(token: Token<T>, context: ResolutionContext = ResolutionContext.INSTANCE): T {
    const registrations = this.getBindings<T>(token)

    if (registrations.length > 1) {
      throw new Error('More than one')
    }

    return this.resolveBinding<T>(token, registrations[0], context)
  }

  resolveAll<T>(token: Token<T>, context: ResolutionContext = ResolutionContext.INSTANCE): T[] {
    const bindings = this.getBindings(token)

    if (bindings.length === 0) {
      let registrations: RegistryEntry[]

      if (isNamedToken(token)) {
        registrations = this.scan((tk, r) => isNamedToken(tk) && r.qualifiers.includes(token))
      } else {
        registrations = this.scan(
          tk => typeof tk === 'function' && tk.name !== (token as Function).name && token.isPrototypeOf(tk)
        )
      }

      if (registrations.length === 0) {
        throw new Error('Nothing here')
      }

      return registrations.map(r => this.resolveBinding(r.token, r.registration, context)) as T[]
    }

    return bindings.map(binding => this.resolveBinding(token, binding, context))
  }

  child(namespace = ''): DI {
    const childContainer = new DI(namespace, this)
    const entries = this._registry.collect()

    if (entries.some(x => x.registration.lifecycle === Lifecycle.CONTAINER)) {
      for (const { token, registration } of entries) {
        const newBinding =
          registration.lifecycle === Lifecycle.CONTAINER
            ? {
                provider: registration.provider,
                dependencies: registration.dependencies,
                primary: registration.primary,
                lifecycle: registration.lifecycle,
                qualifiers: registration.qualifiers,
                namespace: registration.namespace
              }
            : registration
        childContainer._registry.register(token, newBinding)
      }
    }

    return childContainer
  }

  clear(): void {
    this._registry.clear()
  }

  resetInstances(): void {
    for (const [, registration] of this._registry.entries()) {
      registration.instance = undefined
    }
  }

  registerResolver<T>(token: Token<T>, resolver: Resolver<T> | ((ctx: ResolverContext<T>) => T)): void {
    if ('resolve' in resolver) {
      DI.CUSTOM_RESOLVERS.set(token, resolver)
    } else {
      DI.CUSTOM_RESOLVERS.set(token, new FnResolver(resolver))
    }
  }

  //region Internal

  private register<T>(token: Token<T>, binding: TypeInfo<T>) {
    const provider = providerFromToken(token, binding.provider)

    if (!provider) {
      throw new Error(`Could not set a provider for token: ${String(token)}`)
    }

    binding.provider = provider

    this._registry.register(token, binding)
  }

  private getBindings<T>(token: Token<T>): TypeInfo<T>[] {
    if (this.has(token)) {
      return [this._registry.findMany(token)]
    }

    if (this.parent) {
      return this.parent.getBindings(token)
    }

    const nm = this._q.get(token as string)

    if (nm) {
      return nm as TypeInfo<T>[]
    }

    return []
  }

  private resolveBinding<T>(token: Token<T>, registration: TypeInfo<T> | undefined, context: ResolutionContext): T {
    if (registration) {
      if (registration.lifecycle === Lifecycle.RESOLUTION) {
        if (context.resolutions.has(registration)) {
          return context.resolutions.get(registration) as T
        }
      }

      if (!isNil(registration.instance)) {
        return registration.instance as T
      }

      const returnInstance =
        registration.lifecycle === Lifecycle.SINGLETON || registration.lifecycle === Lifecycle.CONTAINER

      if (returnInstance && !isNil(registration.instance)) {
        return registration.instance as T
      }

      let resolved: T | undefined

      if (isValueProvider(registration.provider)) {
        resolved = registration.provider.useValue as T
      } else if (isNamedProvider(registration.provider)) {
        resolved = (
          returnInstance
            ? (registration.instance = this.resolve(registration.provider.useName, context))
            : this.resolve(registration.provider.useName, context)
        ) as T
      } else if (isClassProvider(registration.provider)) {
        resolved = (
          returnInstance
            ? registration.instance ||
              (registration.instance = this.newClassInstance(registration.provider.useClass, context))
            : this.newClassInstance(registration.provider.useClass, context)
        ) as T
      } else if (isFunctionProvider(registration.provider)) {
        if (returnInstance) {
          if (!isNil(registration.instance)) {
            resolved = registration.instance
          } else {
            const type = notNil(DecoratedInjectables.instance().get(token as Ctor), 'Non registered type')
            const deps = type.dependencies.map(dep =>
              dep.multiple ? this.resolveAll(dep.token, context) : this.resolve(dep.token, context)
            )

            registration.instance = registration.provider.useFunction(...deps)
            resolved = registration.instance as T
          }
        } else {
          const type = notNil(DecoratedInjectables.instance().get(token as Ctor), 'Non registered type')
          const deps = type.dependencies.map(dep =>
            dep.multiple ? this.resolveAll(dep.token, context) : this.resolve(dep.token, context)
          )
          resolved = registration.provider.useFunction(...deps) as T
        }
      } else if (isFactoryProvider(registration.provider)) {
        resolved = (
          returnInstance
            ? (registration.instance = registration.provider.useFactory({
                di: this,
                token
              }) as T)
            : registration.provider.useFactory({ di: this, token })
        ) as T
      }

      if (registration?.lifecycle === Lifecycle.RESOLUTION) {
        context.resolutions.set(registration, resolved)
      }

      return resolved as T
    }

    let resolved: T | undefined

    if (token instanceof DeferredCtor) {
      resolved = this.newClassInstance<T>(token, context)
    }

    if (typeof token === 'function') {
      const d = this.scan(tk => typeof tk === 'function' && tk.name !== token.name && token.isPrototypeOf(tk))

      if (d.length === 1) {
        const tk = d[0].token
        resolved = this.resolve<T>(tk as Token<T>, context)
      } else if (d.length > 1) {
        const primary = d.find(x => x.registration.primary)

        if (primary) {
          resolved = this.resolve<T>(primary.token as Token<T>, context)
        } else {
          throw new Error('More than one abstract ref.')
        }
      }
    }

    return resolved as T
  }

  private newClassInstance<T>(ctor: Ctor<T> | DeferredCtor<T>, context: ResolutionContext): T {
    if (ctor instanceof DeferredCtor) {
      return ctor.createProxy(target => this.resolve(target)) as T
    }

    const type = notNil(DecoratedInjectables.instance().get(ctor), 'Non registered type')
    const deps = type.dependencies.map(dep => this.resolveParam(dep, context))

    if (deps.length === 0) {
      if (ctor.length === 0) {
        return new ctor() as T
      } else {
        throw new Error(`Class ${ctor.name} contains unresolvable constructor arguments.`)
      }
    }

    return new ctor(...deps) as T
  }

  private resolveParam<T>(dep: TokenSpec<T>, context: ResolutionContext): T {
    let resolution

    if (dep.multiple) {
      resolution = this.resolveAll(dep.token, context)
    } else {
      resolution = this.resolve(dep.token, context)
    }

    if (isNil(resolution)) {
      const byType = this._registry.findMany(dep.type)
      if (byType) {
        resolution = this.resolveBinding(dep.token, byType, context)
      }
    }

    if (!isNil(resolution)) {
      return resolution
    }

    if (dep.optional) {
      return null as unknown as T
    }

    throw new Error('Unable to resolve parameter')
  }

  private setup() {
    for (const [ctor, info] of DecoratedInjectables.instance().entries()) {
      if (info.namespace !== this.namespace) {
        continue
      }

      if (info.late) {
        continue
      }

      this.register(
        ctor,
        new TypeInfo(
          info.dependencies,
          info.namespace,
          info.lifecycle,
          info.qualifiers,
          info.instance,
          info.provider,
          info.primary
        )
      )

      for (const qualifier of info.qualifiers) {
        this.setQ(qualifier, info)
      }
    }
  }

  private setQ(qualifier: string | symbol, typeInfo: TypeInfo): void {
    const entry = this._q.get(qualifier)

    if (!entry) {
      this._q.set(qualifier, [typeInfo])
    } else {
      entry.push(typeInfo)
      this._q.set(qualifier, entry)
    }
  }

  //endregion
}
