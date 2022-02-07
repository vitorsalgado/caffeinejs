import { isNil } from '../checks/isNil.js'
import { notNil } from '../preconditions/notNil.js'
import { Ctor } from '../types/Ctor.js'
import { newBinding } from './Binding.js'
import { Binding } from './Binding.js'
import { BindingEntry, BindingRegistry } from './BindingRegistry.js'
import { BindTo } from './BindTo.js'
import { DecoratedInjectables } from './DecoratedInjectables.js'
import { RepeatedBeanNamesConfigurationError } from './DiError.js'
import { ScopeAlreadyRegisteredError } from './DiError.js'
import { ScopeNotRegisteredError } from './DiError.js'
import { CircularReferenceError } from './DiError.js'
import { NoUniqueInjectionForTokenError } from './DiError.js'
import { NoResolutionForTokenError } from './DiError.js'
import { DiVars } from './DiVars.js'
import { Identifier } from './Identifier.js'
import { ClassProvider } from './internal/ClassProvider.js'
import { ContainerScope } from './internal/ContainerScope.js'
import { providerFromToken } from './internal/providerFromToken.js'
import { ResolutionContextScope } from './internal/ResolutionContextScope.js'
import { SingletonScope } from './internal/SingletonScope.js'
import { TokenProvider } from './internal/TokenProvider.js'
import { TransientScope } from './internal/TransientScope.js'
import { ResolutionContext } from './ResolutionContext.js'
import { Resolver } from './Resolver.js'
import { Scope } from './Scope.js'
import { Scopes as BuiltInScopes } from './Scopes.js'
import { tokenStr } from './Token.js'
import { isNamedToken, Token } from './Token.js'

export class DI {
  private static readonly Scopes = new Map<Identifier, Scope<unknown>>()
    .set(BuiltInScopes.SINGLETON, new SingletonScope())
    .set(BuiltInScopes.CONTAINER, new ContainerScope())
    .set(BuiltInScopes.RESOLUTION_CONTEXT, new ResolutionContextScope())
    .set(BuiltInScopes.TRANSIENT, new TransientScope())

  private readonly bindingRegistry: BindingRegistry = new BindingRegistry()
  private readonly bindingNames: Map<Identifier, Binding[]> = new Map()

  protected constructor(readonly namespace = '', readonly parent?: DI) {
    notNil(namespace)
  }

  static setup(namespace = '', parent?: DI): DI {
    const di = new DI(namespace, parent)
    di.setup()

    return di
  }

  static configureInjectable<T>(token: Token<T>, opts?: Partial<Binding>): void {
    notNil(token)

    const tk = typeof token === 'object' ? token.constructor : token
    const existing = DecoratedInjectables.instance().get(tk)

    if (existing) {
      const names = existing.names

      if (opts?.names) {
        if (names.some(value => opts.names!.includes(value))) {
          throw new Error()
        }

        names.push(...opts.names)

        opts.names = names
      }
    }

    const binding = newBinding({ ...existing, ...opts })

    if (isNil(binding.provider)) {
      if (typeof tk === 'function') {
        binding.provider = new ClassProvider(tk as Ctor)
      } else if (isNamedToken(tk)) {
        binding.provider = new TokenProvider(tk)
      }
    }

    notNil(binding.provider, `Could not determine a provider for token: ${tokenStr(token)}`)

    DecoratedInjectables.instance().configure(tk, binding)
  }

  static bindScope<T>(scopeId: Identifier, scope: Scope<T>): void {
    notNil(scopeId)
    notNil(scope)

    if (this.Scopes.has(scopeId)) {
      throw new ScopeAlreadyRegisteredError(scopeId)
    }

    DI.Scopes.set(scopeId, scope)
  }

  static unbindScope(scopeId: Identifier): void {
    DI.Scopes.delete(notNil(scopeId))
  }

  get<T>(token: Token<T>, context: ResolutionContext = ResolutionContext.INSTANCE): T {
    const bindings = this.getBindings<T>(token)

    if (bindings.length > 1) {
      const primary = bindings.find(x => x.primary)

      if (primary) {
        return Resolver.resolve<T>(this, token, primary, context)
      }

      throw new NoUniqueInjectionForTokenError(token)
    }

    return Resolver.resolve<T>(this, token, bindings[0], context)
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
        //TODO: change this to nameMap
        entries = this.search((tk, b) => isNamedToken(tk) && b.names.includes(token))
      } else {
        //TODO: create ref cache
        entries = this.search(tk => typeof tk === 'function' && tk !== token && token.isPrototypeOf(tk))
      }

      if (entries.length === 0) {
        return []
      }

      return entries.map(entry => Resolver.resolve(this, entry.token, entry.binding, context))
    }

    return bindings.map(binding => Resolver.resolve(this, token, binding, context))
  }

  has<T>(token: Token<T>, checkParent = false): boolean {
    return this.bindingRegistry.has(token) || (checkParent && (this.parent || false) && this.parent.has(token, true))
  }

  search(predicate: <T>(token: Token<T>, registration: Binding) => boolean): BindingEntry[] {
    notNil(predicate)

    const result: BindingEntry[] = []

    for (const [token, registrations] of this.bindingRegistry.entries()) {
      if (predicate(token, registrations)) {
        result.push({ token, binding: registrations })
      }
    }

    return result
  }

  searchBy<T>(token: Token<T>): Binding<T> | undefined {
    notNil(token)
    return this.bindingRegistry.get(token)
  }

  bind<T>(token: Token<T>): BindTo<T> {
    notNil(token)

    const type = DecoratedInjectables.instance().get(token)
    const binding = newBinding(type)

    this.configureBinding(token, binding)

    return new BindTo<T>(this, token, { ...binding })
  }

  unbind<T>(token: Token<T>, destroy = true): Promise<void> {
    notNil(token)

    if (this.has(token)) {
      const binding = this.bindingRegistry.get(token)

      if (binding?.instance && binding?.preDestroy && destroy) {
        return DI.destroyBinding(binding).finally(() => this.bindingRegistry.delete(token))
      }

      this.bindingRegistry.delete(token)
    }

    if (this.parent) {
      return this.parent.unbind(token)
    }

    return Promise.resolve()
  }

  rebind<T>(token: Token<T>, destroy = true): Promise<BindTo<T>> | BindTo<T> {
    return this.unbind(token, destroy).then(() => this.bind(token))
  }

  newChild(): DI {
    const child = new DI(this.namespace, this)

    this.bindingRegistry
      .toArray()
      .filter(x => x.binding.scopeId === BuiltInScopes.CONTAINER)
      .forEach(({ token, binding }) => {
        const copiedBinding = {
          provider: binding.provider,
          dependencies: binding.dependencies,
          primary: binding.primary,
          scopeId: binding.scopeId,
          names: binding.names,
          namespace: binding.namespace,
          scope: binding.scope
        } as Binding

        copiedBinding.scopedProvider = binding.scope.wrap(binding.provider)
        child.bindingRegistry.register(token, copiedBinding)
      })

    return child
  }

  configureBinding<T>(token: Token<T>, binding: Binding<T>): void {
    const provider = providerFromToken(token, binding.provider)

    notNil(provider, `Could not determine a provider for token: ${tokenStr(token)}`)

    if (provider instanceof TokenProvider) {
      const path = [token]
      let tokenProvider: TokenProvider<any> | null = provider
      const ctx = { di: this, token, binding, resolutionContext: ResolutionContext.INSTANCE }

      while (tokenProvider !== null) {
        const currentToken: Token = tokenProvider.provide(ctx)

        if (path.includes(currentToken)) {
          throw new CircularReferenceError(`Token registration cycle detected! ${[...path, currentToken].join(' -> ')}`)
        }

        path.push(currentToken)

        const binding: Binding | undefined = this.bindingRegistry.get(currentToken)

        if (binding && binding.provider instanceof TokenProvider) {
          tokenProvider = binding.provider
        } else {
          tokenProvider = null
        }
      }
    }

    const scope = this.getScope<T>(binding.scopeId)

    if (!scope) {
      throw new ScopeNotRegisteredError(binding.scopeId)
    }

    binding.provider = provider
    binding.scope = scope
    binding.scopedProvider = binding.scope.wrap(binding.provider)

    this.bindingRegistry.register(token, binding)
  }

  getBindings<T>(token: Token<T>): Binding<T>[] {
    if (this.has(token)) {
      return [this.bindingRegistry.get(token) as Binding<T>]
    }

    if (this.parent) {
      return this.parent.getBindings(token)
    }

    if (isNamedToken(token)) {
      const namedBinding = this.bindingNames.get(token)

      if (namedBinding) {
        return namedBinding
      }
    }

    return []
  }

  getScope<T>(scopeId: Identifier): Scope<T> | undefined {
    return DI.Scopes.get(notNil(scopeId)) as Scope<T> | undefined
  }

  clear(): void {
    this.bindingRegistry.clear()
  }

  resetInstances(): void {
    for (const [, binding] of this.bindingRegistry.entries()) {
      binding.instance = undefined
    }
  }

  bootstrap(): void {
    for (const [token, binding] of this.bindingRegistry.entries()) {
      if (binding.lazy) {
        continue
      }

      Resolver.resolve(this, token, binding, ResolutionContext.INSTANCE)
    }
  }

  finalize(): Promise<void> {
    return Promise.all(
      this.bindingRegistry
        .toArray()
        .filter(({ binding }) => binding.preDestroy && binding.instance)
        .map(({ binding }) => DI.destroyBinding(binding))
    ).then(() => this.resetInstances())
  }

  private static destroyBinding(binding: Binding): Promise<void> {
    const d = binding.instance[binding.preDestroy as Identifier]()

    if (d && 'then' in d && typeof d.then === 'function') {
      return d
    }

    return Promise.resolve()
  }

  private setup(): void {
    const cond = new Map<Token, Binding>()

    for (const [key, binding] of DecoratedInjectables.instance().entries()) {
      if (binding.namespace !== this.namespace) {
        continue
      }

      if (binding.late) {
        continue
      }

      this.configureBinding(key, binding)

      if (binding.conditionals) {
        cond.set(key, binding)
      }

      for (const name of binding.names) {
        const named = this.bindingNames.get(name)

        if (!named) {
          this.bindingNames.set(name, [binding])
        } else {
          named.push(binding)
          this.bindingNames.set(name, named)
        }
      }
    }

    for (const [token, binding] of cond) {
      if (binding.conditionals.length > 0) {
        const pass = binding.conditionals.every(conditional => conditional({ di: this }))

        if (!pass) {
          this.bindingRegistry.delete(token)

          if (binding.configuration) {
            const tokens = Reflect.getOwnMetadata(DiVars.CONFIGURATION_TOKENS_PROVIDED, token)

            for (const tk of tokens) {
              this.bindingRegistry.delete(tk)
            }
          }
        }
      }
    }
  }
}
