import { DI } from './DI.js'
import { ResolutionContext } from './ResolutionContext.js'
import { Token } from './Token.js'

export interface LocatorOptions {
  resolutionContext: ResolutionContext
}

export abstract class ServiceLocator {
  abstract get<T>(key: Token<T>, options?: Partial<LocatorOptions>): T

  abstract getMany<T>(key: Token<T>, options?: Partial<LocatorOptions>): T[]
}

export class DefaultServiceLocator extends ServiceLocator {
  constructor(private readonly di: DI) {
    super()
  }

  get<T>(key: Token<T>, options?: Partial<LocatorOptions>): T {
    return this.di.get(key, options?.resolutionContext)
  }

  getMany<T>(key: Token<T>, options?: Partial<LocatorOptions>): T[] {
    return this.di.getMany(key, options?.resolutionContext)
  }
}
