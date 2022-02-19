import { Token } from './Token.js'
import { Container } from './Container.js'

export interface LocatorOptions {
  args?: unknown
}

export abstract class ServiceLocator {
  abstract get<T>(key: Token<T>, options?: Partial<LocatorOptions>): T

  abstract getMany<T>(key: Token<T>, options?: Partial<LocatorOptions>): T[]

  abstract has(key: Token): boolean
}

export class DefaultServiceLocator extends ServiceLocator {
  constructor(private readonly container: Container) {
    super()
  }

  get<T>(key: Token<T>, options?: Partial<LocatorOptions>): T {
    return this.container.get(key, options?.args)
  }

  getMany<T>(key: Token<T>, options?: Partial<LocatorOptions>): T[] {
    return this.container.getMany(key, options?.args)
  }

  has(key: Token): boolean {
    return this.container.has(key)
  }
}
