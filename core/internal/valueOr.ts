import { isNil } from '../checks/isNil.js'

export function valueOr<T>(value: T, or: NonNullable<T>): NonNullable<T> {
  return isNil<T>(value) ? (value as NonNullable<T>) : or
}
