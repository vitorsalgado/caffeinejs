import { Binder } from './Binder.js'
import { BindTo } from './Binder.js'
import { newBinding } from './Binding.js'
import { Binding } from './Binding.js'
import { BindingEntry, BindingRegistry } from './BindingRegistry.js'
import { DiTypes } from './internal/DiTypes.js'
import { RepeatedInjectableConfigurationError } from './internal/errors.js'
import { ScopeAlreadyRegisteredError } from './internal/errors.js'
import { ScopeNotRegisteredError } from './internal/errors.js'
import { CircularReferenceError } from './internal/errors.js'
import { NoUniqueInjectionForTokenError } from './internal/errors.js'
import { NoResolutionForTokenError } from './internal/errors.js'
import { AfterInitInterceptor } from './internal/interceptors/AfterInitInterceptor.js'
import { BeforeInitInterceptor } from './internal/interceptors/BeforeInitInterceptor.js'
import { ContainerScope } from './internal/scopes/ContainerScope.js'
import { EntrypointProvider } from './internal/EntrypointProvider.js'
import { BuiltInMetadataReader } from './internal/BuiltInMetadataReader.js'
import { MethodInjectorInterceptor } from './internal/interceptors/MethodInjectorInterceptor.js'
import { PostConstructInterceptor } from './internal/interceptors/PostConstructInterceptor.js'
import { PostResolutionInterceptor } from './PostResolutionInterceptor.js'
import { PropertiesInjectorInterceptor } from './internal/interceptors/PropertiesInjectorInterceptor.js'
import { providerFromToken } from './Provider.js'
import { LocalResolutionScope } from './internal/scopes/LocalResolutionScope.js'
import { ScopedProvider } from './internal/scopes/ScopedProvider.js'
import { SingletonScope } from './internal/scopes/SingletonScope.js'
import { TokenProvider } from './internal/providers/TokenProvider.js'
import { TransientScope } from './internal/scopes/TransientScope.js'
import { Vars } from './internal/Vars.js'
import { Lifecycle } from './Lifecycle.js'
import { PostProcessor } from './PostProcessor.js'
import { Resolver } from './Resolver.js'
import { Scope } from './Scope.js'
import { DefaultServiceLocator } from './ServiceLocator.js'
import { ServiceLocator } from './ServiceLocator.js'
import { tokenStr } from './Token.js'
import { isNamedToken, Token } from './Token.js'
import { isNil } from './internal/utils/isNil.js'
import { loadModule } from './internal/utils/loadModule.js'
import { notNil } from './internal/utils/notNil.js'
import { RequestScope } from './internal/scopes/RequestScope.js'
import { RefreshScope } from './internal/scopes/RefreshScope.js'
import { Filter } from './Filter.js'
import { MetadataReader } from './MetadataReader.js'
import { ResolutionContext } from './ResolutionContext.js'
import { ValueProvider } from './internal/providers/ValueProvider.js'
import { Identifier } from './internal/types.js'
import { Container } from './Container.js'
import { InitialOptions } from './Container.js'
import { ContainerOptions } from './Container.js'
import { ContainerLifecycle } from './Container.js'

export class DI implements Container {
  protected static Filters: Filter[] = []
  protected static readonly Scopes = new Map(DI.builtInScopes().entries())
  protected static readonly PostProcessors = new Set<PostProcessor>()
  protected static Inspector?: ContainerLifecycle

  protected readonly bindingRegistry = new BindingRegistry()
  protected readonly bindingNames = new Map<Identifier, Binding[]>()
  protected readonly multipleBeansRefCache = new Map<Token, Binding[]>()
  protected readonly scopeId: Identifier
  protected readonly metadataReader: MetadataReader
  protected readonly lazy?: boolean
  protected readonly lateBind?: boolean
  protected readonly overriding?: boolean

  readonly namespace: Identifier
  readonly parent?: DI

  constructor(options: Partial<ContainerOptions> | Identifier, parent?: DI) {
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
    this.metadataReader = opts.metadataReader || new BuiltInMetadataReader()
  }

  get [Symbol.toStringTag]() {
    return DI.name
  }

  get size(): number {
    return this.bindingRegistry.size()
  }

  static setup(options: Partial<ContainerOptions> | Identifier = '', parent?: DI): DI {
    const di = new DI(options, parent)
    di.setup()

    return di
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

  static addPostProcessor(postProcessor: PostProcessor) {
    DI.PostProcessors.add(notNil(postProcessor))
  }

  static removePostProcessor(posProcessor: PostProcessor) {
    DI.PostProcessors.delete(posProcessor)
  }

  static async scan(paths: string[]): Promise<void> {
    notNil(paths)
    await Promise.all(paths.map(path => loadModule(path)))
  }

  static addFilters(...filters: Filter[]) {
    DI.Filters.push(...notNil(filters))
  }

  static inspector(inspector: ContainerLifecycle) {
    DI.Inspector = notNil(inspector)
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

  protected static registerInternalComponents(container: DI) {
    if (!container.has(ServiceLocator)) {
      container.bind(ServiceLocator).toValue(new DefaultServiceLocator(container)).as(Lifecycle.SINGLETON)
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

  configureBinding<T>(token: Token<T>, incoming: Binding<T>): void {
    notNil(token)
    notNil(incoming)

    const binding = { ...incoming, ...this.metadataReader.read(token) }
    const scopeId = binding.scopeId ? binding.scopeId : this.scopeId
    const rawProvider = providerFromToken(token, binding.rawProvider)

    notNil(rawProvider, `Could not determine a provider for token: ${tokenStr(token)}`)

    if (rawProvider instanceof TokenProvider) {
      const path = [token]
      let tokenProvider: TokenProvider<any> | null = rawProvider
      const ctx: ResolutionContext = { container: this, token, binding }

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
            get: () => Resolver.resolveParam(this, token, spec, propertyKey)
          })
        } else {
          token.prototype[propertyKey] = () => Resolver.resolveParam(this, token, spec, propertyKey)
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
        ? !(
            binding.scopeId === Lifecycle.SINGLETON ||
            binding.scopeId === Lifecycle.CONTAINER ||
            binding.scopeId === Lifecycle.REFRESH
          )
        : binding.lazy === undefined
        ? this.lazy
        : binding.lazy

    this.bindingRegistry.register(token, binding)
    this.mapNamed(binding)
  }

  get<T>(token: Token<T>, args?: unknown): T {
    const bindings = this.getBindings<T>(token)

    if (bindings.length > 1) {
      const primary = bindings.find(x => x.primary)

      if (primary) {
        return Resolver.resolve<T>(this, token, primary, args)
      }

      throw new NoUniqueInjectionForTokenError(token)
    }

    return Resolver.resolve<T>(this, token, bindings[0], args)
  }

  getRequired<T>(token: Token<T>, args?: unknown): T {
    const result = this.get(token, args)

    if (isNil(result)) {
      throw new NoResolutionForTokenError({ token })
    }

    return result
  }

  getMany<T>(token: Token<T>, args?: unknown): T[] {
    const bindings = this.getBindings(token)

    if (bindings.length === 0) {
      if (this.multipleBeansRefCache.has(token)) {
        const bindings = this.multipleBeansRefCache.get(token) as Binding[]

        return bindings.map(binding => Resolver.resolve(this, token, binding, args))
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

      return entries.map(entry => Resolver.resolve(this, entry.token, entry.binding, args))
    }

    return bindings.map(binding => Resolver.resolve(this, token, binding, args))
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

  newChild(): Container {
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
        Resolver.resolve(this, token, binding)
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

  setup(): void {
    for (const [token, binding] of DiTypes.instance().entries()) {
      DI.Inspector?.onBinding(token, binding)

      if (!this.isRegistrable(binding)) {
        DI.Inspector?.onNotBound(token, binding)
        continue
      }

      if (!this.filter(token, binding)) {
        DI.Inspector?.onNotBound(token, binding)
        continue
      }

      const pass = binding.conditionals.every(conditional => conditional({ container: this }))

      if (pass) {
        DI.Inspector?.onBound(token, binding)
        this.configureBinding(token, binding)
      } else {
        DI.Inspector?.onNotBound(token, binding)

        if (binding.configuration) {
          const tokens = Reflect.getOwnMetadata(Vars.CONFIGURATION_TOKENS_PROVIDED, token)

          for (const tk of tokens) {
            DiTypes.instance().deleteBean(tk)
          }
        }
      }
    }

    for (const [token, binding] of DiTypes.instance().beans()) {
      DI.Inspector?.onBinding(token, binding)

      if (!this.isRegistrable(binding)) {
        DI.Inspector?.onNotBound(token, binding)
        continue
      }

      if (!this.filter(token, binding)) {
        DI.Inspector?.onNotBound(token, binding)
        continue
      }

      const pass =
        binding.conditionals === undefined
          ? true
          : binding.conditionals.every(conditional => conditional({ container: this }))

      if (pass) {
        if (this.has(token) && !this.overriding) {
          throw new RepeatedInjectableConfigurationError(
            `Found multiple beans with the same injection token '${tokenStr(token)}' configured at '${
              binding.configuredBy
            }'`
          )
        }

        DI.Inspector?.onBound(token, binding)

        this.configureBinding(token, binding)
      } else {
        DI.Inspector?.onNotBound(token, binding)
      }
    }

    DI.registerInternalComponents(this)
  }

  entries(): Iterable<[Token, Binding]> {
    return this.bindingRegistry.entries()
  }

  qualifiers(): Iterable<[Identifier, Binding[]]> {
    return this.bindingNames.entries()
  }

  toString() {
    return (
      `${DI.name}(namespace=${String(this.namespace)}, count=${this.size}) {` +
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

  protected filter(token: Token, binding: Binding): boolean {
    return DI.Filters.every(filter => !filter.match(token, binding))
  }
}
