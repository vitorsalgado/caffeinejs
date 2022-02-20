export function isFn(value: unknown): value is Function {
  return typeof value === 'function'
}
