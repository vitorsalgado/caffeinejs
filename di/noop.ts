export function noop<T>(..._args: unknown[]): T {
  return undefined as unknown as T
}
