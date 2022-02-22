import { isNil } from '../checks/isNil.js'

export namespace Reflections {
  type PropertyKey = string | symbol

  export function get<R = unknown, K = unknown>(
    key: K,
    target: Function | object,
    propertyKey?: PropertyKey,
  ): R | undefined {
    return Reflect.getMetadata(key, target, propertyKey as PropertyKey) as R | undefined
  }

  export function getOwn<R = unknown, K = unknown>(
    key: K,
    target: Function | object,
    propertyKey?: PropertyKey,
  ): R | undefined {
    return Reflect.getOwnMetadata(key, target, propertyKey as PropertyKey) as R | undefined
  }

  export function has<K = unknown>(key: K, target: Function | object, propertyKey?: PropertyKey): boolean {
    return Reflect.hasMetadata(key, target, propertyKey as PropertyKey)
  }

  export function hasOwn<K = unknown>(key: K, target: Function | object, propertyKey?: PropertyKey): boolean {
    return Reflect.hasOwnMetadata(key, target, propertyKey as PropertyKey)
  }

  export function define<K = unknown, V = unknown>(
    key: K,
    value: V,
    target: Function | object,
    propertyKey?: PropertyKey,
  ): void {
    return Reflect.defineMetadata(key, value, target, propertyKey as PropertyKey)
  }

  export function defineMerging<K, V>(key: K, value: V, target: Function | object, propertyKey?: PropertyKey): V {
    const entry = Reflect.getMetadata(key, target, propertyKey as PropertyKey) as V

    if (isNil(entry)) {
      define(key, value, target, propertyKey)

      return value
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

    define(key, merged, target, propertyKey)

    return merged as V
  }

  export function remove<K = unknown>(key: K, target: Function | object, propertyKey?: PropertyKey): boolean {
    return Reflect.deleteMetadata(key, target, propertyKey as PropertyKey)
  }
}
