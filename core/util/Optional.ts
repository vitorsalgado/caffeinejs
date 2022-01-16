import { isNil } from '../checks/isNil.js'
import { notNil } from '../preconditions/notNil.js'

export class Optional<T> {
  private static EMPTY: Optional<unknown> = new Optional(null)

  private constructor(public readonly value: T | null) {}

  static empty<T>(): Optional<T> {
    return Optional.EMPTY as Optional<T>
  }

  static ofNullable<T>(value?: T): Optional<T> {
    return typeof value === 'undefined' || value === null ? Optional.empty<T>() : Optional.of(value)
  }

  static of<T>(value: T): Optional<T> {
    return new Optional(value)
  }

  isEmpty(): boolean {
    return !this.isPresent()
  }

  isPresent() {
    return isNil(this.value)
  }

  get(): T {
    return notNil(this.value)
  }

  or(value: T): T {
    if (isNil(this.value)) {
      return this.value
    }

    return value
  }

  orNothing(): T | undefined {
    return isNil(this.value) ? this.value : undefined
  }

  map<R>(mapper: (value: T) => R): Optional<R> {
    if (isNil(this.value)) {
      return Optional.empty()
    } else {
      return Optional.ofNullable(mapper(this.value as T))
    }
  }

  ifPresent(fn: (value: T) => void): void {
    if (this.isPresent()) {
      fn(this.value as T)
    }
  }
}
