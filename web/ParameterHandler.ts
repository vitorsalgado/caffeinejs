import { Context } from './Context.js'

export interface ParameterHandler<V = unknown, R = V | Promise<V>> {
  handle: (ctx: Context) => R
}

export class Def<V = unknown, R = V | Promise<V>> implements ParameterHandler<V, R> {
  constructor(private readonly handler: (ctx: Context) => R) {}

  handle(ctx: Context): R {
    return this.handler(ctx)
  }
}
