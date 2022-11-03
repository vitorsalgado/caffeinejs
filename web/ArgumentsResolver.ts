export interface ArgumentsResolver<C> {
  resolve(context: C): unknown[]
}
