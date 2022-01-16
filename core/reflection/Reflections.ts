import { isNil } from '../checks/isNil.js'
import { Ctor } from '../types/Ctor.js'

type PropertyKey = string | symbol

export namespace Reflections {
  export function get<R = unknown, K = unknown, T = unknown>(
    key: K,
    target: Ctor<T> | Function,
    propertyKey?: PropertyKey
  ): R {
    return Reflect.getMetadata(key, target, propertyKey as PropertyKey) as R
  }

  export function getOwn<R = unknown, K = unknown, T = unknown>(
    key: K,
    target: Ctor<T> | Function,
    propertyKey?: PropertyKey
  ): R {
    return Reflect.getOwnMetadata(key, target, propertyKey as PropertyKey) as R
  }

  export function has<K = unknown, T = unknown>(
    key: K,
    target: Ctor<T> | Function,
    propertyKey?: PropertyKey
  ): boolean {
    return Reflect.hasMetadata(key, target, propertyKey as PropertyKey)
  }

  export function hasOwn<K = unknown, T = unknown>(
    key: K,
    target: Ctor<T> | Function,
    propertyKey?: PropertyKey
  ): boolean {
    return Reflect.hasOwnMetadata(key, target, propertyKey as PropertyKey)
  }

  export function define<K = unknown, V = unknown, T = unknown>(
    key: K,
    value: V,
    target: Ctor<T> | Function,
    propertyKey?: PropertyKey
  ): void {
    return Reflect.defineMetadata(key, value, target, propertyKey as PropertyKey)
  }

  export function defineMerging<K, V extends object | unknown[], T = unknown>(
    key: K,
    value: V,
    target: Ctor<T> | Function,
    propertyKey?: PropertyKey
  ): V {
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

  export function remove<K = unknown, T = unknown>(
    key: K,
    target: Ctor<T> | Function,
    propertyKey?: PropertyKey
  ): boolean {
    return Reflect.deleteMetadata(key, target, propertyKey as PropertyKey)
  }
}
