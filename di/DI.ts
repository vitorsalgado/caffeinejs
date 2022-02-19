import { Binder } from './Binder.js'
import { newBinding } from './Binding.js'
import { Binding } from './Binding.js'
import { BindingEntry, BindingRegistry } from './BindingRegistry.js'
import { BindTo } from './BindTo.js'
import { DiTypes } from './DiTypes.js'
import { RepeatedInjectableConfigurationError } from './internal/DiError.js'
import { ScopeAlreadyRegisteredError } from './internal/DiError.js'
import { ScopeNotRegisteredError } from './internal/DiError.js'
import { CircularReferenceError } from './internal/DiError.js'
import { NoUniqueInjectionForTokenError } from './internal/DiError.js'
import { NoResolutionForTokenError } from './internal/DiError.js'
import { Identifier } from './internal/types/Identifier.js'
import { AfterInitInterceptor } from './internal/AfterInitInterceptor.js'
import { BeforeInitInterceptor } from './internal/BeforeInitInterceptor.js'
import { ContainerScope } from './internal/ContainerScope.js'
import { EntrypointProvider } from './internal/EntrypointProvider.js'
import { InternalMetadataReader } from './internal/MetadataReader.js'
import { MetadataReader } from './internal/MetadataReader.js'
import { MethodInjectorInterceptor } from './internal/MethodInjectorInterceptor.js'
import { PostConstructInterceptor } from './internal/PostConstructInterceptor.js'
import { PostResolutionInterceptor } from './PostResolutionInterceptor.js'
import { PropertiesInjectorInterceptor } from './internal/PropertiesInjectorInterceptor.js'
import { providerFromToken } from './Provider.js'
import { LocalResolutionScope } from './internal/LocalResolutionScope.js'
import { ScopedProvider } from './internal/ScopedProvider.js'
import { SingletonScope } from './internal/SingletonScope.js'
import { TokenProvider } from './internal/TokenProvider.js'
import { TransientScope } from './internal/TransientScope.js'
import { Vars } from './internal/Vars.js'
import { Lifecycle } from './Lifecycle.js'
import { InitialOptions } from './Options.js'
import { Options } from './Options.js'
import { PostProcessor } from './PostProcessor.js'
import { LocalResolutions } from './LocalResolutions.js'
import { Resolver } from './Resolver.js'
import { Scope } from './Scope.js'
import { DefaultServiceLocator } from './ServiceLocator.js'
import { ServiceLocator } from './ServiceLocator.js'
import { tokenStr } from './Token.js'
import { isNamedToken, Token } from './Token.js'
import { check } from './internal/utils/check.js'
import { isNil } from './internal/utils/isNil.js'
import { loadModule } from './internal/utils/loadModule.js'
import { notNil } from './internal/utils/notNil.js'
import { RequestScope } from './internal/RequestScope.js'
import { ValueProvider } from './internal/index.js'
import { ResolutionContext } from './internal/index.js'
import { RefreshScope } from './internal/RefreshScope.js'

export class DI {
  static MetadataReader = new InternalMetadataReader()
  protected static readonly Scopes = new Map(DI.builtInScopes().entries())
  protected static readonly PostProcessors = new Set<PostProcessor>()

  protected readonly bindingRegistry = new BindingRegistry()
  protected readonly bindingNames = new Map<Identifier, Binding[]>()
  protected readonly multipleBeansRefCache = new Map<Token, Binding[]>()
  protected readonly scopeId: Identifier
  protected readonly lazy?: boolean
  protected readonly lateBind?: boolean
  protected readonly overriding?: boolean

  readonly namespace: Identifier
  readonly parent?: DI

  protected constructor(options: Partial<Options> | Identifier, parent?: DI) {
    const opts =
      typeof options === 'string' || typeof options === 'symbol'
        ? { ...InitialOptions, namespace: options }
        : { ...InitialOptions, ...options }

    this.parent = parent
    this.namespace = opts.namespace || ''
    this.lazy = opts.lazy
    this.lateBind = opts.lateBind
    this.overriding = opts.overriding
    this.scopeId = opts.scopeId || Lifecycle.SINGLETON
  }

  static setup(options: Partial<Options> | Identifier = '', parent?: DI): DI {
    const di = new DI(options, parent)
    di.setup()

    return di
  }

  static configureType<T>(token: Token<T>, additional?: Partial<Binding>): void {
    notNil(token)

    const opts = { ...DI.MetadataReader.read(token), ...additional }
    const tk = typeof token === 'object' ? token.constructor : token
    const existing = DiTypes.instance().get(tk)

    if (existing) {
      const names = existing.names

      if (opts?.names) {
        if (names.some(value => opts.names!.includes(value))) {
          throw new RepeatedInjectableConfigurationError(
            `Found repeated qualifiers for the class '${tokenStr(token)}'. Qualifiers found: ${opts.names
              .map(x => tokenStr(x))
              .join(', ')}`
          )
        }

        names.push(...opts.names)

        opts.names = names
      } else {
        opts.names = existing.names
      }
    }

    DiTypes.instance().configure(tk, newBinding({ ...existing, ...opts }))
  }

  static addBean<T>(token: Token<T>, binding: Binding<T>): void {
    DiTypes.instance().addBean(token, binding)
  }

  static bindScope(scopeId: Identifier, scope: Scope): void {
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

  static hasScope(scopeId: Identifier): boolean {
    return DI.Scopes.has(scopeId)
  }

  static getScope<T extends Scope = Scope>(scopeId: Identifier): T {
    const scope = DI.Scopes.get(scopeId)

    if (scope === undefined) {
      throw new ScopeNotRegisteredError(scopeId)
    }

    return scope as T
  }

  static bindPostProcessor(postProcessor: PostProcessor) {
    DI.PostProcessors.add(notNil(postProcessor))
  }

  static unbindPostProcessor(posProcessor: PostProcessor) {
    DI.PostProcessors.delete(posProcessor)
  }

  static async scan(paths: string[]): Promise<void> {
    notNil(paths)
    await Promise.all(paths.map(path => loadModule(path)))
  }

  static changeMetadataReader(other: MetadataReader) {
    notNil(other)
    check('read' in other && other.read.length === 1, 'Provided instance must be an MetadataReader implementation.')

    DI.MetadataReader = other
  }

  configureBinding<T>(token: Token<T>, binding: Binding<T>): void {
    notNil(token)
    notNil(binding)

    const scopeId = binding.scopeId ? binding.scopeId : this.scopeId
    const rawProvider = providerFromToken(token, binding.rawProvider)

    notNil(rawProvider, `Could not determine a provider for token: ${tokenStr(token)}`)

    if (rawProvider instanceof TokenProvider) {
      const path = [token]
      let tokenProvider: TokenProvider<any> | null = rawProvider
      const ctx: ResolutionContext = { di: this, token, binding, localResolutions: LocalResolutions.INSTANCE }

      while (tokenProvider !== null) {
        const currentToken: Token = tokenProvider.provide(ctx)

        if (path.includes(currentToken)) {
          throw new CircularReferenceError(`Token registration cycle detected! ${[...path, currentToken].join(' -> ')}`)
        }

        path.push(currentToken)

        const binding: Binding | undefined = this.bindingRegistry.get(currentToken)

        if (binding && binding.rawProvider instanceof TokenProvider) {
          tokenProvider = binding.rawProvider
        } else {
          tokenProvider = null
        }
      }
    }

    const scope =
      rawProvider instanceof TokenProvider || rawProvider instanceof ValueProvider
        ? DI.getScope(Lifecycle.TRANSIENT)
        : DI.getScope(scopeId)

    const hasPropertyInjections = binding.injectableProperties.length > 0
    const hasMethodInjections = binding.injectableMethods.length > 0
    const hasLookups = binding.lookupProperties.length > 0
    const chain: PostResolutionInterceptor<T>[] = []

    if (hasLookups && typeof token === 'function') {
      for (const [propertyKey, spec] of binding.lookupProperties) {
        const descriptor = Object.getOwnPropertyDescriptor(token.prototype, propertyKey)

        if (descriptor && typeof descriptor.get === 'function') {
          Object.defineProperty(token.prototype, propertyKey, {
            get: () => Resolver.resolveParam(this, token, spec, propertyKey, LocalResolutions.INSTANCE)
          })
        } else {
          token.prototype[propertyKey] = () =>
            Resolver.resolveParam(this, token, spec, propertyKey, LocalResolutions.INSTANCE)
        }
      }
    }

    if (hasPropertyInjections) {
      chain.push(new PropertiesInjectorInterceptor())
    }

    if (hasMethodInjections) {
      chain.push(new MethodInjectorInterceptor())
    }

    for (const interceptor of binding.interceptors) {
      chain.push(interceptor)
    }

    for (const postProcessor of DI.PostProcessors) {
      chain.push(new BeforeInitInterceptor(postProcessor))
    }

    if (binding.postConstruct) {
      chain.push(new PostConstructInterceptor())
    }

    for (const postProcessor of DI.PostProcessors) {
      chain.push(new AfterInitInterceptor(postProcessor))
    }

    if (scope.registerDestructionCallback) {
      if (binding.preDestroy) {
        scope.registerDestructionCallback(() => scope.cachedInstance<any>(binding)?.[binding.preDestroy!]())
      }
    }

    binding.scopeId = scopeId
    binding.rawProvider = rawProvider
    binding.scopedProvider = new ScopedProvider(scope, new EntrypointProvider(rawProvider, chain))
    binding.late = binding.late === undefined ? this.lateBind : binding.late
    binding.lazy = binding.lazy =
      binding.lazy === undefined && this.lazy === undefined
        ? !(binding.scopeId === Lifecycle.SINGLETON || binding.scopeId === Lifecycle.CONTAINER)
        : binding.lazy === undefined
        ? this.lazy
        : binding.lazy

    this.bindingRegistry.register(token, binding)
    this.mapNamed(binding)
  }

  get<T>(token: Token<T>, context: LocalResolutions = LocalResolutions.INSTANCE): T {
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

  getRequired<T>(token: Token<T>, context: LocalResolutions = LocalResolutions.INSTANCE): T {
    const result = this.get(token, context)

    if (isNil(result)) {
      throw new NoResolutionForTokenError({ token })
    }

    return result
  }

  getMany<T>(token: Token<T>, context: LocalResolutions = LocalResolutions.INSTANCE): T[] {
    const bindings = this.getBindings(token)

    if (bindings.length === 0) {
      if (this.multipleBeansRefCache.has(token)) {
        const bindings = this.multipleBeansRefCache.get(token) as Binding[]

        return bindings.map(binding => Resolver.resolve(this, token, binding, context))
      }

      let entries = this.search(tk => tk !== token && token.isPrototypeOf(tk))

      if (entries.length === 0) {
        entries = this.search((tk, binding) => binding.type === token)
      }

      if (entries.length === 0) {
        return []
      } else {
        this.multipleBeansRefCache.set(
          token,
          entries.map(entry => entry.binding)
        )
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

  bind<T>(token: Token<T>): Binder<T> {
    notNil(token)

    const type = DiTypes.instance().get(token)
    const binding = newBinding(type)

    this.configureBinding(token, binding)

    return new BindTo<T>(this, token, { ...binding })
  }

  unbind<T>(token: Token<T>): void {
    notNil(token)

    if (this.has(token)) {
      return this.unref(token)
    }

    if (this.parent) {
      this.parent.unbind(token)
    }
  }

  async unbindAsync<T>(token: Token<T>): Promise<void> {
    notNil(token)

    if (this.has(token)) {
      const bindings = this.getBindings(token)

      for (const binding of bindings) {
        if (binding.preDestroy) {
          await DI.preDestroyBinding(binding).finally(() => this.unref(token))
        }
      }

      this.unref(token)
    }

    if (this.parent) {
      return this.parent.unbindAsync(token)
    }

    return Promise.resolve()
  }

  rebind<T>(token: Token<T>): Binder<T> {
    this.unbind(token)
    return this.bind(token)
  }

  rebindAsync<T>(token: Token<T>): Promise<Binder<T>> {
    return this.unbindAsync(token).then(() => this.bind(token))
  }

  newChild(): DI {
    const child = new DI(
      {
        lazy: this.lazy,
        scopeId: this.scopeId,
        lateBind: this.lateBind,
        namespace: this.namespace
      },
      this
    )

    this.bindingRegistry
      .toArray()
      .filter(x => x.binding.scopeId === Lifecycle.CONTAINER)
      .forEach(({ token, binding }) => child.bindingRegistry.register(token, newBinding({ ...binding, id: undefined })))

    DI.registerInternalComponents(child)

    return child
  }

  getBindings<T>(token: Token<T>): Binding<T>[] {
    if (this.has(token)) {
      return [this.bindingRegistry.get(token) as Binding<T>]
    }

    if (this.parent) {
      return this.parent.getBindings(token)
    }

    if (isNamedToken(token)) {
      return this.bindingNames.get(token) || []
    }

    return []
  }

  clear(): void {
    this.bindingRegistry.clear()
  }

  resetInstances(): void {
    for (const [, binding] of this.bindingRegistry.entries()) {
      DI.getScope(binding.scopeId).remove(binding)
    }
  }

  resetInstance(token: Token): void {
    notNil(token)

    const bindings = this.getBindings(token)

    for (const binding of bindings) {
      DI.getScope(binding.scopeId).remove(binding)
    }
  }

  async resetInstanceAsync(token: Token): Promise<void> {
    notNil(token)

    const bindings = this.getBindings(token)

    for (const binding of bindings) {
      if (binding.preDestroy) {
        await DI.preDestroyBinding(binding).finally(() => this.unref(token))
      }

      DI.getScope(binding.scopeId).remove(binding)
    }
  }

  bootstrap(): void {
    for (const [token, binding] of this.bindingRegistry.entries()) {
      if (
        !binding.lazy &&
        (binding.scopeId === Lifecycle.SINGLETON ||
          binding.scopeId === Lifecycle.CONTAINER ||
          binding.scopeId === Lifecycle.REFRESH)
      ) {
        Resolver.resolve(this, token, binding, LocalResolutions.INSTANCE)
      }
    }
  }

  dispose(): Promise<void> {
    return Promise.all(
      this.bindingRegistry
        .toArray()
        .filter(({ binding }) => binding.preDestroy)
        .map(({ binding }) => DI.preDestroyBinding(binding))
    ).then(() => this.resetInstances())
  }

  size(): number {
    return this.bindingRegistry.size()
  }

  entries(): Iterable<[Token, Binding]> {
    return this.bindingRegistry.entries()
  }

  aliases(): Iterable<[Identifier, Binding[]]> {
    return this.bindingNames.entries()
  }

  toString() {
    return (
      `${DI.name}(namespace=${String(this.namespace)}, count=${this.size()}) {` +
      '\n' +
      this.bindingRegistry
        .toArray()
        .map(
          x =>
            `${tokenStr(x.token)}: ` +
            `names=[${x.binding.names?.map(x => tokenStr(x)).join(', ')}], ` +
            `scope=${x.binding.scopeId.toString()}, ` +
            `injections=[${x.binding.injections
              ?.map(
                x =>
                  '[' +
                  (x.token ? tokenStr(x.token) : `${tokenStr(x.tokenType)}`) +
                  `: optional=${x.optional || false}, multiple=${x.multiple || false}]`
              )
              .join(', ')}], ` +
            `lazy=${x.binding.lazy}, ` +
            `provider=${x.binding.rawProvider?.constructor?.name}`
        )
        .join('\n, ') +
      '\n}'
    )
  }

  [Symbol.iterator](): IterableIterator<[Token, Binding]> {
    return this.bindingRegistry.entries()
  }

  get [Symbol.toStringTag]() {
    return DI.name
  }

  protected static async preDestroyBinding(binding: Binding): Promise<void> {
    const scope = DI.Scopes.get(binding.scopeId) as Scope
    const instance: any = scope.cachedInstance(binding)

    const r = instance?.[binding.preDestroy as Identifier]()

    if (r && 'then' in r && typeof r.then === 'function') {
      return r.finally(() => scope.remove(binding))
    }

    scope.remove(binding)

    return Promise.resolve()
  }

  protected static registerInternalComponents(di: DI) {
    if (!di.has(ServiceLocator)) {
      di.bind(ServiceLocator).toValue(new DefaultServiceLocator(di)).as(Lifecycle.SINGLETON)
    }
  }

  protected static builtInScopes() {
    return new Map<Identifier, Scope>()
      .set(Lifecycle.SINGLETON, new SingletonScope())
      .set(Lifecycle.CONTAINER, new ContainerScope())
      .set(Lifecycle.LOCAL_RESOLUTION, new LocalResolutionScope())
      .set(Lifecycle.TRANSIENT, new TransientScope())
      .set(Lifecycle.REQUEST, new RequestScope())
      .set(Lifecycle.REFRESH, new RefreshScope())
  }

  protected setup(): void {
    const conditionals = new Map<Token, Binding>()

    for (const [key, binding] of DiTypes.instance().entries()) {
      if (!this.isRegistrable(binding)) {
        continue
      }

      this.configureBinding(key, binding)

      if (binding.conditionals) {
        conditionals.set(key, binding)
      }
    }

    for (const [token, binding] of conditionals) {
      if (binding.conditionals.length > 0) {
        const pass = binding.conditionals.every(conditional => conditional({ di: this }))

        if (!pass) {
          this.bindingRegistry.delete(token)

          if (binding.configuration) {
            const tokens = Reflect.getOwnMetadata(Vars.CONFIGURATION_TOKENS_PROVIDED, token)

            for (const tk of tokens) {
              DiTypes.instance().deleteBean(tk)
            }
          }
        }
      }
    }

    for (const [token, binding] of DiTypes.instance().beans()) {
      if (!this.isRegistrable(binding)) {
        continue
      }

      const pass =
        binding.conditionals === undefined ? true : binding.conditionals.every(conditional => conditional({ di: this }))

      if (pass) {
        if (this.has(token) && !this.overriding) {
          throw new RepeatedInjectableConfigurationError(
            `Found multiple beans with the same injection token '${tokenStr(token)}' configured at '${
              binding.configuredBy
            }'`
          )
        }

        this.configureBinding(token, binding)
      }
    }

    DI.registerInternalComponents(this)
  }

  protected isRegistrable(binding: Binding): boolean {
    return binding.namespace === this.namespace && (binding.late == undefined || !binding.late)
  }

  protected mapNamed(binding: Binding): void {
    for (const name of binding.names) {
      const named = this.bindingNames.get(name)

      if (!named) {
        this.bindingNames.set(name, [binding])
      } else {
        if (!named.some(x => x.id === binding.id)) {
          named.push(binding)
          this.bindingNames.set(name, named)
        }
      }
    }
  }

  protected unref(token: Token) {
    const bindings = this.getBindings(token)

    this.bindingRegistry.delete(token)
    this.multipleBeansRefCache.delete(token)

    if (isNamedToken(token)) {
      this.bindingNames.delete(token)
    }

    for (const binding of bindings) {
      DI.getScope(binding.scopeId).remove(binding)
    }
  }
}
