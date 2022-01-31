import { valueOr } from '../_internal/valueOr.js'
import { Ctor } from '../types/Ctor.js'
import { Binding } from './Binding.js'

export class DecoratedInjectables {
  private static INSTANCE: DecoratedInjectables = new DecoratedInjectables()
  private readonly _entries: Map<Ctor, Binding> = new Map()

  private constructor() {
    // internal
  }

  static instance(): DecoratedInjectables {
    return DecoratedInjectables.INSTANCE
  }

  configure<T>(ctor: Ctor<T>, info: Partial<Binding>): DecoratedInjectables {
    const entry = this._entries.get(ctor)

    if (entry) {
      this._entries.set(ctor, { ...entry, ...info, qualifiers: [...entry.qualifiers, ...valueOr(info.qualifiers, [])] })
    } else {
      const i = Binding.newBinding(info)
      this._entries.set(ctor, i)
    }

    return this
  }

  get<T>(ctor: Ctor<T>): Binding<T> | undefined {
    return this._entries.get(ctor)
  }

  entries(): IterableIterator<[Ctor, Binding]> {
    return this._entries.entries()
  }
}
