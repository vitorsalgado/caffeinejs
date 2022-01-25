import { isNil } from '../checks/isNil.js'
import { notNil } from '../preconditions/notNil.js'
import { Ctor } from '../types/Ctor.js'
import { Binding } from './Binding.js'
import { DecoratedInjectables } from './DecoratedInjectables.js'
import { DeferredCtor } from './DeferredCtor.js'
import { providerFromToken } from './Provider.js'
import { isNamedProvider } from './Provider.js'
import { isFactoryProvider } from './Provider.js'
import { isValueProvider } from './Provider.js'
import { isFunctionProvider } from './Provider.js'
import { isClassProvider } from './Provider.js'
import { Registry, RegistryEntry } from './Registry.js'
import { Scope } from './Scope.js'
import { isNamedToken, Token } from './Token.js'
import { newTypeInfo, TypeInfo } from './TypeInfo.js'

export class DI {
  private readonly _registry: Registry = new Registry()

  constructor(private readonly namespace = '', private readonly parent?: DI) {
    this.setup()
  }

  static setup(namespace = '', parent?: DI): DI {
    return new DI(namespace, parent)
  }

  static configureInjectable<T>(token: Ctor<T>, opts?: Partial<TypeInfo>) {
    const options = newTypeInfo(opts)

    if (isNil(options.provider)) {
      if (typeof token === 'function') {
        options.provider = { useClass: token }
      } else if (isNamedToken(token)) {
        options.provider = { useName: token }
      }
    }

    if (!options.provider) {
      throw new Error(`Could not set a provider for token: ${String(token)}`)
    }

    DecoratedInjectables.instance().configure(token, options)
  }

  has<T>(token: Token<T>): boolean {
    return this._registry.has(token)
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

  resolve<T>(token: Token<T>): T {
    const registration = this._registry.findSingle<T>(token)
    return this.resolveBinding<T>(token, registration)
  }

  resolveAll<T>(token: Token<T>): T[] {
    const bindings = this._registry.findMany(token)

    if (bindings.length === 0) {
      const d = this.scan(tk => typeof tk === 'function' && tk !== token && token.isPrototypeOf(tk))

      const r = d.flatMap(x => x.registrations.map(y => this.resolveBinding(x.token, y))) as T[]

      if (r.length === 0) {
        throw new Error('Nothing here')
      }
    }

    const resolution = bindings.map(binding => this.resolveBinding(token, binding))

    if (resolution.length === 0) {
      const d = this.scan(tk => typeof tk === 'function' && tk !== token && token.isPrototypeOf(tk))

      return d.flatMap(x => x.registrations.map(y => this.resolveBinding(x.token, y))) as T[]
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

  private resolveBinding<T>(token: Token<T>, registration?: Binding<T>): T {
    if (registration) {
      if (typeof registration.instance !== 'undefined') {
        return registration.instance as T
      }

      const returnInstance = registration.lifecycle === Scope.SINGLETON || registration.lifecycle === Scope.CONTAINER

      if (returnInstance && !isNil(registration.instance)) {
        return registration.instance as T
      }

      let resolved: T | undefined

      if (isValueProvider(registration.provider)) {
        resolved = registration.provider.useValue as T
      } else if (isNamedProvider(registration.provider)) {
        resolved = (
          returnInstance
            ? (registration.instance = this.resolve(registration.provider.useName))
            : this.resolve(registration.provider.useName)
        ) as T
      } else if (isClassProvider(registration.provider)) {
        resolved = (
          returnInstance
            ? registration.instance || (registration.instance = this.newClassInstance(registration.provider.useClass))
            : this.newClassInstance(registration.provider.useClass)
        ) as T
      } else if (isFunctionProvider(registration.provider)) {
        if (returnInstance) {
          if (!isNil(registration.instance)) {
            resolved = registration.instance
          } else {
            const type = notNil(DecoratedInjectables.instance().get(token as Ctor), 'Non registered type')
            const deps = type.dependencies.map(dep =>
              dep.multiple ? this.resolveAll(dep.token) : this.resolve(dep.token)
            )

            registration.instance = registration.provider.useFunction(...deps)
            resolved = registration.instance as T
          }
        } else {
          const type = notNil(DecoratedInjectables.instance().get(token as Ctor), 'Non registered type')
          const deps = type.dependencies.map(dep =>
            dep.multiple ? this.resolveAll(dep.token) : this.resolve(dep.token)
          )
          resolved = registration.provider.useFunction(...deps) as T
        }
      } else if (isFactoryProvider(registration.provider)) {
        resolved = (
          returnInstance
            ? (registration.instance = registration.provider.useFactory(this))
            : registration.provider.useFactory(this)
        ) as T
      }

      return resolved as T
    }

    if (token instanceof DeferredCtor) {
      return this.newClassInstance<T>(token as DeferredCtor<T>)
    }

    if (typeof token === 'function') {
      const d = this.scan(tk => typeof tk === 'function' && tk !== token && token.isPrototypeOf(tk))

      if (d.length === 1) {
        const tk = d[0].token
        return this.resolve<T>(tk as Token<T>)
      } else if (d.length > 1) {
        const primary = d.find(x => x.registrations.some(y => y.primary))

        if (primary) {
          return this.resolve<T>(primary.token as Token<T>)
        }

        throw new Error('More than one abstract ref.')
      }
    }

    throw new Error('error')
  }

  private newClassInstance<T>(ctor: Ctor<T> | DeferredCtor<T>): T {
    if (ctor instanceof DeferredCtor) {
      return ctor.createProxy(target => this.resolve(target)) as T
    }

    const type = notNil(DecoratedInjectables.instance().get(ctor), 'Non registered type')
    const dependencies = type.dependencies

    const deps = dependencies.map(dep => {
      if (dep.multiple) {
        return this.resolveAll(dep.token)
      } else {
        return this.resolve(dep.token)
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
