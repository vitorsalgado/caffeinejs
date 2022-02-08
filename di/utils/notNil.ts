export function notNil<T>(value: T, message = 'Value must not be null or undefined.'): NonNullable<T> {
  if (value === null || typeof value === 'undefined') {
    throw new Error(message)
  }

  return value as NonNullable<T>
}
