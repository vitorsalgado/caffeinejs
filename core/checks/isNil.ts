export function isNil<T>(value: T | null): value is NonNullable<T> {
  return typeof value === 'undefined' || value === null
}
