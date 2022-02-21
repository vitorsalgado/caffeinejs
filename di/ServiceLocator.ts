import { Token } from './Token.js'
import { Container } from './Container.js'

export interface LocatorOptions<A = unknown> {
  args?: A
}

export abstract class ServiceLocator {
  abstract get<T, A = unknown>(key: Token<T>, options?: Partial<LocatorOptions<A>>): T

  abstract getMany<T, A = unknown>(key: Token<T>, options?: Partial<LocatorOptions<A>>): T[]

  abstract has(key: Token): boolean
}

export class DefaultServiceLocator extends ServiceLocator {
  constructor(private readonly container: Container) {
    super()
  }

  get<T, A = unknown>(key: Token<T>, options?: Partial<LocatorOptions<A>>): T {
    return this.container.get(key, options?.args)
  }

  getMany<T, A = unknown>(key: Token<T>, options?: Partial<LocatorOptions<A>>): T[] {
    return this.container.getMany(key, options?.args)
  }

  has(key: Token): boolean {
    return this.container.has(key)
  }
}
