import { isNil } from './isNil.js'

export function mergeObject<T>(value: any, other: any): T {
  const res: Record<string | symbol, unknown> = {}

  Object.keys({ ...value, ...other }).map(key => (res[key] = isNil(other[key]) ? value[key] : other[key]))

  return res as T
}
