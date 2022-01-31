import { isNil } from '../checks/isNil.js'
import { notNil } from '../preconditions/notNil.js'
import { Ctor } from '../types/Ctor.js'
import { Binding } from './Binding.js'
import { BindingEntry, BindingRegistry } from './BindingRegistry.js'
import { BindTo } from './BindTo.js'
import { DecoratedInjectables } from './DecoratedInjectables.js'
import { DeferredCtor } from './DeferredCtor.js'
import { CircularReferenceError } from './errors.js'
import { NoResolutionForTokenError } from './errors.js'
import { UnresolvableConstructorArguments } from './errors.js'
import { TypeNotRegisteredForInjectionError } from './errors.js'
import { NoUniqueInjectionForTokenError } from './errors.js'
import { NoProviderForTokenError } from './errors.js'
import { Lifecycle } from './Lifecycle.js'
import { providerFromToken } from './Provider.js'
import { isNamedProvider } from './Provider.js'
import { isFactoryProvider } from './Provider.js'
import { isValueProvider } from './Provider.js'
import { isFunctionProvider } from './Provider.js'
import { isClassProvider } from './Provider.js'
import { ResolutionContext } from './ResolutionContext.js'
import { TokenSpec } from './Token.js'
import { isNamedToken, Token } from './Token.js'

export class DI {
  private readonly _registry: BindingRegistry = new BindingRegistry()
  private readonly _namedLinks: Map<string | symbol, Binding[]> = new Map()

  protected constructor(readonly namespace = '', readonly parent?: DI) {
    notNil(namespace)
  }

  static setup(namespace = '', parent?: DI): DI {
    const di = new DI(namespace, parent)
    di.setup()

    return di
  }

  static configureInjectable<T>(token: Ctor<T> | Function | object, opts?: Partial<Binding>): void {
    notNil(token)

    const tk = typeof token === 'object' ? token.constructor : token
    const existing = DecoratedInjectables.instance().get(tk as Ctor<T>)
    const binding = Binding.newBinding({ ...existing, ...opts })

    if (isNil(binding.provider)) {
      if (typeof tk === 'function') {
        binding.provider = { useClass: tk as Ctor<T> }
      } else if (isNamedToken(tk)) {
        binding.provider = { useName: tk }
      }
    }

    if (!binding.provider) {
      throw new NoProviderForTokenError(tk)
    }

    DecoratedInjectables.instance().configure(tk as Ctor<T>, binding)
  }

  bind<T>(token: Token<T>): BindTo<T> {
    notNil(token)

    const type = DecoratedInjectables.instance().get(token as Ctor)
    const binding = Binding.newBinding(type)

    this.register(token, binding)

    return new BindTo<T>(token, binding)
  }

  has<T>(token: Token<T>, checkParent = false): boolean {
    return this._registry.has(token) || (checkParent && (this.parent || false) && this.parent.has(token, true))
  }

  scan(predicate: <T>(token: Token<T>, registration: Binding) => boolean): BindingEntry[] {
    const result: BindingEntry[] = []

    for (const [token, registrations] of this._registry.entries()) {
      if (predicate(token, registrations)) {
        result.push({ token, binding: registrations })
      }
    }

    return result
  }

  resolve<T>(token: Token<T>, context: ResolutionContext = ResolutionContext.INSTANCE): T {
    const resolution = this.internalResolve(token, context)

    if (isNil(resolution)) {
      throw new NoResolutionForTokenError({ token })
    }

    return resolution
  }

  resolveLax<T>(token: Token<T>, context: ResolutionContext = ResolutionContext.INSTANCE): T {
    return this.internalResolve(token, context)
  }

  resolveAll<T>(token: Token<T>, context: ResolutionContext = ResolutionContext.INSTANCE): T[] {
    const bindings = this.getBindings(token)

    if (bindings.length === 0) {
      let entries: BindingEntry[]

      if (isNamedToken(token)) {
        entries = this.scan((tk, r) => isNamedToken(tk) && r.qualifiers.includes(token))
      } else {
        entries = this.scan(tk => typeof tk === 'function' && tk !== token && token.isPrototypeOf(tk))
      }

      if (entries.length === 0) {
        return []
      }

      return entries.map(r => this.resolveBinding(r.token, r.binding, context)) as T[]
    }

    return bindings.map(binding => this.resolveBinding(token, binding, context))
  }

  child(): DI {
    const child = new DI(this.namespace, this)

    this._registry
      .collect()
      .filter(x => x.binding.lifecycle === Lifecycle.CONTAINER)
      .forEach(({ token, binding }) =>
        child._registry.register(token, {
          provider: binding.provider,
          dependencies: binding.dependencies,
          primary: binding.primary,
          lifecycle: binding.lifecycle,
          qualifiers: binding.qualifiers,
          namespace: binding.namespace
        })
      )

    return child
  }

  clear(): void {
    this._registry.clear()
  }

  resetInstances(): void {
    for (const [, binding] of this._registry.entries()) {
      binding.instance = undefined
    }
  }

  parse(): void {
    for (const [token, binding] of this._registry.entries()) {
      if (binding.lazy) {
        continue
      }

      this.resolveBinding(token, binding, ResolutionContext.INSTANCE)
    }
  }

  //region Internal

  private internalResolve<T>(token: Token<T>, context: ResolutionContext = ResolutionContext.INSTANCE): T {
    const bindings = this.getBindings<T>(token)

    if (bindings.length > 1) {
      const primary = bindings.find(x => x.primary)

      if (primary) {
        return this.resolveBinding<T>(token, primary, context)
      }

      throw new NoUniqueInjectionForTokenError(token)
    }

    return this.resolveBinding<T>(token, bindings[0], context)
  }

  private register<T>(token: Token<T>, binding: Binding<T>) {
    const provider = providerFromToken(token, binding.provider)

    if (!provider) {
      throw new NoProviderForTokenError(token)
    }

    binding.provider = provider

    this._registry.register(token, binding)
  }

  private getBindings<T>(token: Token<T>): Binding<T>[] {
    if (this.has(token)) {
      return [this._registry.find(token) as Binding<T>]
    }

    if (this.parent) {
      return this.parent.getBindings(token)
    }

    const nm = this._namedLinks.get(token as string)

    if (nm) {
      return nm as Binding<T>[]
    }

    return []
  }

  private resolveBinding<T>(token: Token<T>, binding: Binding<T> | undefined, context: ResolutionContext): T {
    if (binding) {
      if (binding.lifecycle === Lifecycle.RESOLUTION_CONTEXT) {
        if (context.resolutions.has(binding)) {
          return context.resolutions.get(binding) as T
        }
      }

      if (!isNil(binding.instance)) {
        return binding.instance as T
      }

      const returnInstance = binding.lifecycle === Lifecycle.SINGLETON || binding.lifecycle === Lifecycle.CONTAINER

      if (returnInstance && !isNil(binding.instance)) {
        return binding.instance as T
      }

      let resolved: T | undefined

      if (isValueProvider(binding.provider)) {
        resolved = binding.provider.useValue as T
      } else if (isNamedProvider(binding.provider)) {
        resolved = (
          returnInstance
            ? (binding.instance = this.internalResolve(binding.provider.useName, context))
            : this.internalResolve(binding.provider.useName, context)
        ) as T
      } else if (isClassProvider(binding.provider)) {
        resolved = (
          returnInstance
            ? binding.instance || (binding.instance = this.newClassInstance(binding.provider.useClass, context))
            : this.newClassInstance(binding.provider.useClass, context)
        ) as T
      } else if (isFunctionProvider(binding.provider)) {
        if (returnInstance) {
          if (!isNil(binding.instance)) {
            resolved = binding.instance
          } else {
            const type = notNil(DecoratedInjectables.instance().get(token as Ctor), 'Non registered type')
            const deps = type.dependencies.map(dep =>
              dep.multiple ? this.resolveAll(dep.token, context) : this.internalResolve(dep.token, context)
            )

            binding.instance = binding.provider.useFunction(...deps)
            resolved = binding.instance as T
          }
        } else {
          const type = notNil(DecoratedInjectables.instance().get(token as Ctor), 'Non registered type')
          const deps = type.dependencies.map(dep =>
            dep.multiple ? this.resolveAll(dep.token, context) : this.internalResolve(dep.token, context)
          )
          resolved = binding.provider.useFunction(...deps) as T
        }
      } else if (isFactoryProvider(binding.provider)) {
        resolved = (
          returnInstance
            ? (binding.instance = binding.provider.useFactory({
                di: this,
                token
              }) as T)
            : binding.provider.useFactory({ di: this, token })
        ) as T
      }

      if (binding?.lifecycle === Lifecycle.RESOLUTION_CONTEXT) {
        context.resolutions.set(binding, resolved)
      }

      return resolved as T
    }

    let resolved: T | undefined

    if (token instanceof DeferredCtor) {
      resolved = this.newClassInstance<T>(token, context)
    }

    if (typeof token === 'function') {
      const entries = this.scan(tk => typeof tk === 'function' && tk.name !== token.name && token.isPrototypeOf(tk))

      if (entries.length === 1) {
        const tk = entries[0].token
        resolved = this.internalResolve<T>(tk as Token<T>, context)
      } else if (entries.length > 1) {
        const primary = entries.find(x => x.binding.primary)

        if (primary) {
          resolved = this.internalResolve<T>(primary.token as Token<T>, context)
        } else {
          throw new NoUniqueInjectionForTokenError(token)
        }
      }
    }

    return resolved as T
  }

  private newClassInstance<T>(ctor: Ctor<T> | DeferredCtor<T>, context: ResolutionContext): T {
    if (ctor instanceof DeferredCtor) {
      return ctor.createProxy(target => this.internalResolve(target))
    }

    const type = DecoratedInjectables.instance().get(ctor)
    if (!type) {
      throw new TypeNotRegisteredForInjectionError(ctor)
    }

    const deps = type.dependencies.map(dep => this.resolveParam(ctor, dep, context))

    if (deps.length === 0) {
      if (ctor.length === 0) {
        return new ctor()
      } else {
        throw new UnresolvableConstructorArguments(ctor)
      }
    }

    return new ctor(...deps)
  }

  private resolveParam<T>(ctor: Ctor<T>, dep: TokenSpec<T>, context: ResolutionContext): T {
    if (isNil(dep.token) && isNil(dep.tokenType)) {
      throw new CircularReferenceError(ctor)
    }

    let resolution

    if (dep.multiple) {
      resolution = this.resolveAll(dep.token, context)
    } else {
      resolution = this.internalResolve(dep.token, context)
    }

    if (isNil(resolution)) {
      const byType = this._registry.find(dep.tokenType)
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

    throw new NoResolutionForTokenError(dep)
  }

  private setup() {
    for (const [type, binding] of DecoratedInjectables.instance().entries()) {
      if (binding.namespace !== this.namespace) {
        continue
      }

      if (binding.late) {
        continue
      }

      this.register(
        type,
        new Binding(
          binding.dependencies,
          binding.namespace,
          binding.lifecycle,
          binding.qualifiers,
          binding.instance,
          binding.provider,
          binding.primary,
          binding.late,
          binding.lazy
        )
      )

      for (const qualifier of binding.qualifiers) {
        const entry = this._namedLinks.get(qualifier)

        if (!entry) {
          this._namedLinks.set(qualifier, [binding])
        } else {
          entry.push(binding)
          this._namedLinks.set(qualifier, entry)
        }
      }
    }
  }

  //endregion
}
