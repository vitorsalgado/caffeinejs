import { isNil } from '../checks/isNil.js'
import { notNil } from '../preconditions/notNil.js'
import { Ctor } from '../types/Ctor.js'
import { Binding } from './Binding.js'
import { BindingEntry, BindingRegistry } from './BindingRegistry.js'
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
import { ResolutionContext } from './ResolutionContext.js'
import { TokenSpec } from './Token.js'
import { isNamedToken, Token } from './Token.js'

export class DI {
  private readonly _registry: BindingRegistry = new BindingRegistry()
  private readonly _namedLinks: Map<string | symbol, Binding[]> = new Map()

  protected constructor(readonly namespace = '', readonly parent?: DI) {}

  static setup(namespace = '', parent?: DI): DI {
    const di = new DI(namespace, parent)
    di.setup()

    return di
  }

  static configureInjectable<T>(token: Ctor<T> | Function | object, opts?: Partial<Binding>): void {
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
      throw new Error(`Could not set a provider for token: ${String(tk)}`)
    }

    DecoratedInjectables.instance().configure(tk as Ctor<T>, binding)
  }

  bind<T>(token: Token<T>): BindTo<T> {
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
    const bindings = this.getBindings<T>(token)

    if (bindings.length > 1) {
      throw new Error('More than one')
    }

    return this.resolveBinding<T>(token, bindings[0], context)
  }

  resolveAll<T>(token: Token<T>, context: ResolutionContext = ResolutionContext.INSTANCE): T[] {
    const bindings = this.getBindings(token)

    if (bindings.length === 0) {
      let entries: BindingEntry[]

      if (isNamedToken(token)) {
        entries = this.scan((tk, r) => isNamedToken(tk) && r.qualifiers.includes(token))
      } else {
        entries = this.scan(
          tk => typeof tk === 'function' && tk.name !== (token as Function).name && token.isPrototypeOf(tk)
        )
      }

      if (entries.length === 0) {
        throw new Error('Nothing here')
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
      .forEach(({ token, binding }) => {
        child._registry.register(token, {
          provider: binding.provider,
          dependencies: binding.dependencies,
          primary: binding.primary,
          lifecycle: binding.lifecycle,
          qualifiers: binding.qualifiers,
          namespace: binding.namespace
        })
      })

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

  //region Internal

  private register<T>(token: Token<T>, binding: Binding<T>) {
    const provider = providerFromToken(token, binding.provider)

    if (!provider) {
      throw new Error(`Could not set a provider for token: ${String(token)}`)
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
            ? (binding.instance = this.resolve(binding.provider.useName, context))
            : this.resolve(binding.provider.useName, context)
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
              dep.multiple ? this.resolveAll(dep.token, context) : this.resolve(dep.token, context)
            )

            binding.instance = binding.provider.useFunction(...deps)
            resolved = binding.instance as T
          }
        } else {
          const type = notNil(DecoratedInjectables.instance().get(token as Ctor), 'Non registered type')
          const deps = type.dependencies.map(dep =>
            dep.multiple ? this.resolveAll(dep.token, context) : this.resolve(dep.token, context)
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
      const d = this.scan(tk => typeof tk === 'function' && tk.name !== token.name && token.isPrototypeOf(tk))

      if (d.length === 1) {
        const tk = d[0].token
        resolved = this.resolve<T>(tk as Token<T>, context)
      } else if (d.length > 1) {
        const primary = d.find(x => x.binding.primary)

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
      return ctor.createProxy(target => this.resolve(target))
    }

    const type = notNil(DecoratedInjectables.instance().get(ctor), 'Non registered type')
    const deps = type.dependencies.map(dep => this.resolveParam(dep, context))

    if (deps.length === 0) {
      if (ctor.length === 0) {
        return new ctor()
      } else {
        throw new Error(`Class ${ctor.name} contains unresolvable constructor arguments.`)
      }
    }

    return new ctor(...deps)
  }

  private resolveParam<T>(dep: TokenSpec<T>, context: ResolutionContext): T {
    let resolution

    if (dep.multiple) {
      resolution = this.resolveAll(dep.token, context)
    } else {
      resolution = this.resolve(dep.token, context)
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

    throw new Error('Unable to resolve parameter')
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
          binding.primary
        )
      )

      for (const qualifier of binding.qualifiers) {
        this.linkNamedToBinding(qualifier, binding)
      }
    }
  }

  private linkNamedToBinding(qualifier: string | symbol, binding: Binding): void {
    const entry = this._namedLinks.get(qualifier)

    if (!entry) {
      this._namedLinks.set(qualifier, [binding])
    } else {
      entry.push(binding)
      this._namedLinks.set(qualifier, entry)
    }
  }

  //endregion
}
