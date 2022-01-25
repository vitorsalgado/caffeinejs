import { valueOr } from '../_internal/valueOr.js'
import { Ctor } from '../types/Ctor.js'
import { newTypeInfo, TypeInfo } from './TypeInfo.js'

export class DecoratedInjectables {
  private static INSTANCE: DecoratedInjectables = new DecoratedInjectables()
  private readonly _entries: Map<Ctor<unknown>, TypeInfo> = new Map()

  private constructor() {
    // internal
  }

  static instance(): DecoratedInjectables {
    return DecoratedInjectables.INSTANCE
  }

  configure<T>(ctor: Ctor<T>, info: Partial<TypeInfo>): DecoratedInjectables {
    const entry = this._entries.get(ctor)

    if (entry) {
      this._entries.set(ctor, { ...entry, ...info, qualifiers: [...entry.qualifiers, ...valueOr(info.qualifiers, [])] })
    } else {
      const i = newTypeInfo(info)
      this._entries.set(ctor, i)
    }

    return this
  }

  get(ctor: Ctor<unknown>): TypeInfo | undefined {
    return this._entries.get(ctor)
  }

  entries(): IterableIterator<[Ctor<unknown>, TypeInfo]> {
    return this._entries.entries()
  }

  toArray(): [Ctor<unknown>, TypeInfo][] {
    return Array.from(this._entries.entries())
  }
}
