import { isNil } from '../checks/isNil.js'
import { notNil } from '../preconditions/notNil.js'
import { Ctor } from '../types/Ctor.js'
import { Binding } from './Binding.js'
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
import { isNamedToken, Token } from './Token.js'
import { newTypeInfo, TypeInfo } from './TypeInfo.js'

export class DI {
  private readonly _registry: Registry = new Registry()

  protected constructor(readonly namespace = '', readonly parent?: DI) {}

  static setup(namespace = '', parent?: DI): DI {
    const di = new DI(namespace, parent)
    di.setup()

    return di
  }

  static configureInjectable<T>(token: Ctor<T> | Function | object, opts?: Partial<TypeInfo>) {
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

  has<T>(token: Token<T>, checkParent = false): boolean {
    return this._registry.has(token) || (checkParent && (this.parent || false) && this.parent.has(token, true))
  }

  scan(predicate: (token: Token<unknown>, registration: Binding<unknown>[]) => boolean): RegistryEntry[] {
    const result: RegistryEntry[] = []

    for (const [token, registrations] of this._registry.entries()) {
      if (predicate(token, registrations)) {
        result.push({ token, registrations })
      }
    }

    return result
  }

  resolve<T>(token: Token<T>, context: ResolutionContext = ResolutionContext.INSTANCE): T {
    const registrations = this.getBindings<T>(token)

    if (registrations.length > 1) {
      throw new Error('More than one')
    }

    const registration = registrations[0]

    return this.resolveBinding<T>(token, registration, context)
  }

  resolveAll<T>(token: Token<T>, context: ResolutionContext = ResolutionContext.INSTANCE): T[] {
    const bindings = this.getBindings(token)

    if (bindings.length === 0) {
      const d = this.scan(tk => typeof tk === 'function' && tk !== token && token.isPrototypeOf(tk))
      const r = d.flatMap(x => x.registrations.map(y => this.resolveBinding(x.token, y, context))) as T[]

      if (r.length === 0) {
        throw new Error('Nothing here')
      }
    }

    const resolution = bindings.map(binding => this.resolveBinding(token, binding, context))

    if (resolution.length === 0) {
      const d = this.scan(tk => typeof tk === 'function' && tk !== token && token.isPrototypeOf(tk))

      return d.flatMap(x => x.registrations.map(y => this.resolveBinding(x.token, y, context))) as T[]
    }

    return resolution
  }

  register<T>(token: Token<T>, binding: Binding<T>) {
    const provider = providerFromToken(token, binding.provider)

    if (!provider) {
      throw new Error(`Could not set a provider for token: ${String(token)}`)
    }

    binding.provider = provider

    this._registry.register(
      token,
      new Binding(notNil(binding.lifecycle), notNil(binding.provider), notNil(binding.dependencies), binding.primary)
    )
  }

  child(namespace = ''): DI {
    const childContainer = new DI(namespace, this)

    for (const [token, registrations] of this._registry.entries()) {
      if (registrations.some(options => options.lifecycle === Lifecycle.CONTAINER)) {
        for (const registration of registrations) {
          const newBinding =
            registration.lifecycle === Lifecycle.CONTAINER
              ? {
                  provider: registration.provider,
                  dependencies: registration.dependencies,
                  primary: registration.primary,
                  lifecycle: registration.lifecycle
                }
              : registration
          childContainer._registry.register(token, newBinding)
        }
      }
    }

    return childContainer
  }

  clear(): void {
    this._registry.clear()
  }

  resetInstances(): void {
    for (const [, registrations] of this._registry.entries()) {
      for (const registration of registrations) {
        registration.instance = undefined
      }
    }
  }

  private getBindings<T>(token: Token<T>): Binding<T>[] {
    if (this.has(token)) {
      return this._registry.findMany(token)
    }

    if (this.parent) {
      return this.parent.getBindings(token)
    }

    return []
  }

  private resolveBinding<T>(token: Token<T>, registration: Binding<T>, context: ResolutionContext): T {
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
          ? (registration.instance = registration.provider.useFactory(this))
          : registration.provider.useFactory(this)
      ) as T
    } else {
      if (token instanceof DeferredCtor) {
        resolved = this.newClassInstance<T>(token as DeferredCtor<T>, context)
      }

      if (typeof token === 'function') {
        const d = this.scan(tk => typeof tk === 'function' && tk !== token && token.isPrototypeOf(tk))

        if (d.length === 1) {
          const tk = d[0].token
          resolved = this.resolve<T>(tk as Token<T>, context)
        } else if (d.length > 1) {
          const primary = d.find(x => x.registrations.some(y => y.primary))

          if (primary) {
            resolved = this.resolve<T>(primary.token as Token<T>, context)
          } else {
            throw new Error('More than one abstract ref.')
          }
        }
      }
    }

    if (registration.lifecycle === Lifecycle.RESOLUTION) {
      context.resolutions.set(registration, resolved)
    }

    return resolved as T
  }

  private newClassInstance<T>(ctor: Ctor<T> | DeferredCtor<T>, context: ResolutionContext): T {
    if (ctor instanceof DeferredCtor) {
      return ctor.createProxy(target => this.resolve(target)) as T
    }

    const type = notNil(DecoratedInjectables.instance().get(ctor), 'Non registered type')
    const dependencies = type.dependencies

    const deps = dependencies.map(dep => {
      if (dep.multiple) {
        return this.resolveAll(dep.token, context)
      } else {
        return this.resolve(dep.token, context)
      }
    })

    if (deps.length === 0) {
      if (ctor.length === 0) {
        return new ctor() as T
      } else {
        throw new Error(`Class ${ctor.name} contains unresolvable constructor arguments.`)
      }
    }

    return new ctor(...deps) as T
  }

  private setup() {
    for (const [ctor, info] of DecoratedInjectables.instance().entries()) {
      if (info.namespace !== this.namespace) {
        continue
      }

      this.register(ctor, new Binding<unknown>(info.scope, info.provider, info.dependencies, info.primary))

      for (const alias of info.qualifiers) {
        this.register(alias, new Binding<unknown>(info.scope, info.provider, info.dependencies))
      }
    }
  }
}
