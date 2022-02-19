import { newBinding } from '../Binding.js'
import { Binding } from '../Binding.js'
import { Token } from '../Token.js'
import { tokenStr } from '../Token.js'
import { notNil } from './utils/notNil.js'
import { RepeatedInjectableConfigurationError } from './DiError.js'

export class DiTypes {
  private static INSTANCE = new DiTypes()
  private readonly _entries = new Map<Token, Binding>()
  private readonly _beans: Array<[Token, Binding]> = []

  private constructor() {
    // internal
  }

  static instance(): DiTypes {
    return DiTypes.INSTANCE
  }

  configure<T>(token: Token<T>, additional: Partial<Binding>): DiTypes {
    notNil(token)

    const opts = { ...additional }
    const tk = typeof token === 'object' ? token.constructor : token
    const existing = DiTypes.instance().get(tk)

    if (existing) {
      const names = existing.names

      if (opts?.names) {
        if (names.some(value => opts.names!.includes(value))) {
          throw new RepeatedInjectableConfigurationError(
            `Found repeated qualifiers for the class '${tokenStr(token)}'. Qualifiers found: ${opts.names
              .map(x => tokenStr(x))
              .join(', ')}`
          )
        }

        names.push(...opts.names)

        opts.names = names
      } else {
        opts.names = existing.names
      }
    }

    const info = newBinding({ ...existing, ...opts })
    const entry = this._entries.get(tk)

    if (entry) {
      this._entries.set(tk, { ...entry, ...info })
    } else {
      this._entries.set(tk, newBinding(info))
    }

    return this
  }

  addBean<T>(token: Token<T>, binding: Binding<T>): DiTypes {
    notNil(token)
    notNil(binding)

    this._beans.push([token, binding])

    return this
  }

  deleteBean(token: Token): void {
    const idx = this._beans.findIndex(([k]) => k === token)

    if (idx > -1) {
      this._beans.splice(idx, 1)
    }
  }

  get<T>(ctor: Token<T>): Binding<T> | undefined {
    return this._entries.get(ctor)
  }

  entries(): IterableIterator<[Token, Binding]> {
    return this._entries.entries()
  }

  beans(): Array<[Token, Binding]> {
    return this._beans
  }

  delete(token: Token): boolean {
    notNil(token)
    return this._entries.delete(token)
  }
}
