import { DI } from './DI.js'
import { Token } from './Token.js'

export interface LocatorOptions {
  args?: unknown
}

export abstract class ServiceLocator {
  abstract get<T>(key: Token<T>, options?: Partial<LocatorOptions>): T

  abstract getMany<T>(key: Token<T>, options?: Partial<LocatorOptions>): T[]

  abstract has(key: Token): boolean
}

export class DefaultServiceLocator extends ServiceLocator {
  constructor(private readonly di: DI) {
    super()
  }

  get<T>(key: Token<T>, options?: Partial<LocatorOptions>): T {
    return this.di.get(key, options?.args)
  }

  getMany<T>(key: Token<T>, options?: Partial<LocatorOptions>): T[] {
    return this.di.getMany(key, options?.args)
  }

  has(key: Token): boolean {
    return this.di.has(key)
  }
}
