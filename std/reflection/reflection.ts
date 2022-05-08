import { isNil } from '../checks/isNil.js'

type PropertyKey = string | symbol

function get<R = unknown, K = unknown>(key: K, target: Object, propertyKey?: PropertyKey): R | undefined {
  return Reflect.getMetadata(key, target, propertyKey as PropertyKey) as R | undefined
}

function getOwn<R = unknown, K = unknown>(key: K, target: Object, propertyKey?: PropertyKey): R | undefined {
  return Reflect.getOwnMetadata(key, target, propertyKey as PropertyKey) as R | undefined
}

function has<K = unknown>(key: K, target: Object, propertyKey?: PropertyKey): boolean {
  return Reflect.hasMetadata(key, target, propertyKey as PropertyKey)
}

function hasOwn<K = unknown>(key: K, target: Object, propertyKey?: PropertyKey): boolean {
  return Reflect.hasOwnMetadata(key, target, propertyKey as PropertyKey)
}

function set<V = unknown, K = unknown>(key: K, value: V, target: Object, propertyKey?: PropertyKey): void {
  return Reflect.defineMetadata(key, value, target, propertyKey as PropertyKey)
}

function setMerging<V, K = unknown>(key: K, value: Partial<V>, target: Object, propertyKey?: PropertyKey): void {
  const entry = Reflect.getMetadata(key, target, propertyKey as PropertyKey) as V

  if (isNil(entry)) {
    set(key, value, target, propertyKey)
    return
  }

  let merged

  if (typeof entry === 'object' && typeof value === 'object') {
    if (Array.isArray(entry)) {
      if (!Array.isArray(value)) {
        throw new TypeError('Attempt to merge a object value with an array entry.')
      }

      merged = [...entry, ...value]
    } else {
      merged = { ...entry, ...value }
    }
  } else {
    throw new TypeError('Attempt to merge metadata definition with a non object type.')
  }

  set(key, merged, target, propertyKey)
}

function mergeField<T, F extends keyof T, K = unknown>(
  key: K,
  field: F,
  value: T[F],
  target: Object,
  propertyKey?: PropertyKey,
): T {
  let entry = Reflect.getMetadata(key, target, propertyKey as PropertyKey) as T

  if (isNil(entry)) {
    entry = {} as T
    entry[field] = value

    set(key, entry, target, propertyKey)

    return entry as T
  }

  entry[field] = { ...entry[field], ...value }

  set(key, entry, target, propertyKey)

  return entry
}

function pushField<T = unknown, V = unknown, K = unknown>(
  key: K,
  field: keyof T,
  value: V,
  target: Object,
  propertyKey?: PropertyKey,
): T {
  let entry = Reflect.getMetadata(key, target, propertyKey as PropertyKey)

  if (entry === undefined || entry === null) {
    entry = {} as T
    entry[field] = [value]

    set(key, entry, target, propertyKey)

    return entry as T
  }

  if (entry[field] == undefined) {
    entry[field] = []
  }

  entry[field].push(value)

  set(key, entry, target, propertyKey)

  return entry
}

function remove<K = unknown>(key: K, target: Object, propertyKey?: PropertyKey): boolean {
  return Reflect.deleteMetadata(key, target, propertyKey as PropertyKey)
}

export const Reflections = {
  get,
  getOwn,
  has,
  hasOwn,
  set,
  setMerging,
  mergeField,
  pushField,
  remove,
}

export const R = Reflections
