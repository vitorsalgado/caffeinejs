import { isNil } from '../checks/isNil.js'
import { notNil } from '../preconditions/notNil.js'

export class Maybe<T> {
  private static EMPTY: Maybe<unknown> = new Maybe(null)

  private constructor(public readonly value: T | null) {}

  static empty<T>(): Maybe<T> {
    return Maybe.EMPTY as Maybe<T>
  }

  static ofNullable<T>(value?: T | null): Maybe<T> {
    return typeof value === 'undefined' || value === null ? Maybe.empty<T>() : Maybe.of(value)
  }

  static of<T>(value: T): Maybe<T> {
    return new Maybe(value)
  }

  isEmpty(): boolean {
    return !this.isPresent()
  }

  isPresent() {
    return !isNil(this.value)
  }

  get(): T {
    return notNil(this.value)
  }

  or(value: T): T {
    if (this.isPresent()) {
      return this.value as T
    }

    return value
  }

  orNothing(): T | undefined {
    return this.isPresent() ? (this.value as T) : undefined
  }

  map<R>(mapper: (value: T) => R): Maybe<R> {
    if (this.isPresent()) {
      return Maybe.ofNullable(mapper(this.value as T))
    } else {
      return Maybe.empty()
    }
  }

  ifPresent(fn: (value: T) => void): void {
    if (this.isPresent()) {
      fn(this.value as T)
    }
  }
}
