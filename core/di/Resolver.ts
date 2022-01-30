import { DI } from './DI.js'
import { Token } from './Token.js'

export interface ResolverContext<T> {
  di: DI
  token: Token<T>
}

export interface Resolver<T> {
  resolve(ctx: ResolverContext<T>): T
}

export type ResolverType<T> = (ctx: ResolverContext<T>) => T | Resolver<T>

export class FnResolver<T> implements Resolver<T> {
  constructor(private readonly fn: (ctx: ResolverContext<T>) => T) {}

  resolve(ctx: ResolverContext<T>): T {
    return this.fn(ctx)
  }
}
