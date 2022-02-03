import { isNil } from '../checks/isNil.js'
import { notNil } from '../preconditions/notNil.js'
import { Ctor } from '../types/Ctor.js'
import { newBinding } from './Binding.js'
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
import { DiError } from './errors/DiError.js'
import { Lifecycle } from './Lifecycle.js'
import { TokenProvider } from './Provider.js'
import { isTokenProvider } from './Provider.js'
import { isDeferredProvider } from './Provider.js'
import { providerFromToken } from './Provider.js'
import { isNamedProvider } from './Provider.js'
import { isFactoryProvider } from './Provider.js'
import { isValueProvider } from './Provider.js'
import { isFunctionProvider } from './Provider.js'
import { isClassProvider } from './Provider.js'
import { ResolutionContext } from './ResolutionContext.js'
import { tokenStr } from './Token.js'
import { TokenSpec } from './Token.js'
import { isNamedToken, Token } from './Token.js'

export class DI {
  private readonly _registry: BindingRegistry = new BindingRegistry()
  private readonly _qualifiersMap: Map<string | symbol, Binding[]> = new Map()

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
    const binding = newBinding({ ...existing, ...opts })

    if (isNil(binding.provider)) {
      if (typeof tk === 'function') {
        binding.provider = { useClass: tk as Ctor<T> }
      } else if (isNamedToken(tk)) {
        binding.provider = { useName: tk }
      }
    }

    if (!binding.provider) {
      throw new DiError(
        `Could not determine a provider for token: ${tokenStr(token as Token)}`,
        DiError.CODE_NO_PROVIDER
      )
    }

    DecoratedInjectables.instance().configure(tk as Ctor<T>, binding)
  }

  get<T>(token: Token<T>, context: ResolutionContext = ResolutionContext.INSTANCE): T {
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

  getRequired<T>(token: Token<T>, context: ResolutionContext = ResolutionContext.INSTANCE): T {
    const result = this.get(token, context)

    if (isNil(result)) {
      throw new NoResolutionForTokenError({ token })
    }

    return result
  }

  getMany<T>(token: Token<T>, context: ResolutionContext = ResolutionContext.INSTANCE): T[] {
    const bindings = this.getBindings(token)

    if (bindings.length === 0) {
      let entries: BindingEntry[]

      if (isNamedToken(token)) {
        entries = this.search((tk, r) => isNamedToken(tk) && r.qualifiers.includes(token))
      } else {
        entries = this.search(tk => typeof tk === 'function' && tk !== token && token.isPrototypeOf(tk))
      }

      if (entries.length === 0) {
        return []
      }

      return entries.map(r => this.resolveBinding(r.token, r.binding, context)) as T[]
    }

    return bindings.map(binding => this.resolveBinding(token, binding, context))
  }

  has<T>(token: Token<T>, checkParent = false): boolean {
    return this._registry.has(token) || (checkParent && (this.parent || false) && this.parent.has(token, true))
  }

  search(predicate: <T>(token: Token<T>, registration: Binding) => boolean): BindingEntry[] {
    const result: BindingEntry[] = []

    for (const [token, registrations] of this._registry.entries()) {
      if (predicate(token, registrations)) {
        result.push({ token, binding: registrations })
      }
    }

    return result
  }

  bind<T>(token: Token<T>): BindTo<T> {
    notNil(token)

    const type = DecoratedInjectables.instance().get(token as Ctor)
    const binding = newBinding(type)

    this.registerBinding(token, binding)

    return new BindTo<T>(token, binding)
  }

  unbind<T>(token: Token<T>): void {
    this._registry.remove(token)
  }

  rebind<T>(token: Token<T>): BindTo<T> {
    this.unbind(token)
    return this.bind(token)
  }

  newChild(): DI {
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

  registerBinding<T>(token: Token<T>, binding: Binding<T>) {
    const provider = providerFromToken(token, binding.provider)

    if (!provider) {
      throw new NoProviderForTokenError(token)
    }

    if (isTokenProvider(provider)) {
      const path = [token]
      let tokenProvider: TokenProvider<T> | null = provider

      while (tokenProvider !== null) {
        const currentToken: Token = tokenProvider.useToken

        if (path.includes(currentToken)) {
          throw new Error(`Token registration cycle detected! ${[...path, currentToken].join(' -> ')}`)
        }

        path.push(currentToken)

        const binding: Binding | undefined = this._registry.find(currentToken)

        if (binding && isTokenProvider(binding.provider)) {
          tokenProvider = binding.provider
        } else {
          tokenProvider = null
        }
      }
    }

    binding.provider = provider

    this._registry.register(token, binding)
  }

  clear(): void {
    this._registry.clear()
  }

  resetInstances(): void {
    for (const [, binding] of this._registry.entries()) {
      binding.instance = undefined
    }
  }

  init(): void {
    for (const [token, binding] of this._registry.entries()) {
      if (binding.lazy) {
        continue
      }

      this.resolveBinding(token, binding, ResolutionContext.INSTANCE)
    }
  }

  async finalize(): Promise<void> {
    for (const [, binding] of this._registry.entries()) {
      if (
        binding.onDestroy &&
        binding.instance &&
        (binding.lifecycle === Lifecycle.SINGLETON || binding.lifecycle === Lifecycle.CONTAINER)
      ) {
        await binding.instance[binding.onDestroy]()
      }
    }

    this.clear()
  }

  //region Internal

  private getBindings<T>(token: Token<T>): Binding<T>[] {
    if (this.has(token)) {
      return [this._registry.find(token) as Binding<T>]
    }

    if (this.parent) {
      return this.parent.getBindings(token)
    }

    const nm = this._qualifiersMap.get(token as string)

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

      let resolved: T | undefined

      if (isValueProvider(binding.provider)) {
        resolved = binding.provider.useValue
      } else if (isNamedProvider(binding.provider)) {
        resolved = returnInstance
          ? (binding.instance = this.get(binding.provider.useName, context))
          : this.get(binding.provider.useName, context)
      } else if (isClassProvider(binding.provider)) {
        resolved = returnInstance
          ? binding.instance || (binding.instance = this.newClassInstance(binding.provider.useClass, context))
          : this.newClassInstance(binding.provider.useClass, context)
      } else if (isTokenProvider(binding.provider)) {
        resolved = returnInstance
          ? binding.instance || (binding.instance = this.get(binding.provider.useToken, context))
          : this.get(binding.provider.useToken, context)
      } else if (isFunctionProvider(binding.provider)) {
        if (returnInstance) {
          if (!isNil(binding.instance)) {
            resolved = binding.instance
          } else {
            const type = notNil(DecoratedInjectables.instance().get(token as Ctor), 'Non registered type')
            const deps = type.dependencies.map(dep =>
              dep.multiple ? this.getMany(dep.token, context) : this.get(dep.token, context)
            )

            binding.instance = binding.provider.useFunction(...deps)
            resolved = binding.instance
          }
        } else {
          const type = notNil(DecoratedInjectables.instance().get(token as Ctor), 'Non registered type')
          const deps = type.dependencies.map(dep =>
            dep.multiple ? this.getMany(dep.token, context) : this.get(dep.token, context)
          )
          resolved = binding.provider.useFunction(...deps)
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
      } else if (isDeferredProvider(binding.provider)) {
        resolved = returnInstance
          ? binding.instance || (binding.instance = this.newClassInstance(binding.provider.useDefer, context))
          : this.newClassInstance(binding.provider.useDefer, context)
      }

      if (binding.lifecycle === Lifecycle.RESOLUTION_CONTEXT) {
        context.resolutions.set(binding, resolved)
      }

      return resolved as T
    }

    let resolved: T | undefined

    if (token instanceof DeferredCtor) {
      resolved = this.newClassInstance<T>(token, context)
    }

    if (typeof token === 'function') {
      const entries = this.search(tk => typeof tk === 'function' && tk.name !== token.name && token.isPrototypeOf(tk))

      if (entries.length === 1) {
        const tk = entries[0].token
        resolved = this.get<T>(tk as Token<T>, context)

        this.registerBinding(token, newBinding({ provider: { useToken: tk }, namespace: this.namespace }))
      } else if (entries.length > 1) {
        const primary = entries.find(x => x.binding.primary)

        if (primary) {
          resolved = this.get<T>(primary.token as Token<T>, context)

          this.registerBinding(token, newBinding({ provider: { useToken: primary.token }, ...primary }))
        } else {
          throw new NoUniqueInjectionForTokenError(token)
        }
      }
    }

    return resolved as T
  }

  private newClassInstance<T>(ctor: Ctor<T> | DeferredCtor<T>, context: ResolutionContext): T {
    if (ctor instanceof DeferredCtor) {
      return ctor.createProxy(target => this.get(target))
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
      resolution = this.getMany(dep.token, context)
    } else {
      resolution = this.get(dep.token, context)
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

      this.registerBinding(type, { ...binding })

      for (const qualifier of binding.qualifiers) {
        const entry = this._qualifiersMap.get(qualifier)

        if (!entry) {
          this._qualifiersMap.set(qualifier, [binding])
        } else {
          entry.push(binding)
          this._qualifiersMap.set(qualifier, entry)
        }
      }
    }
  }

  //endregion
}
