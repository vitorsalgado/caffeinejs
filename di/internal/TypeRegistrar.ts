import { newBinding } from '../Binding.js'
import { Binding } from '../Binding.js'
import { Token } from '../Token.js'
import { tokenStr } from '../Token.js'
import { notNil } from './utils/notNil.js'
import { RepeatedInjectableConfigurationError } from './errors.js'

export namespace TypeRegistrar {
  const _entries = new Map<Token, Binding>()
  const _beans: Array<[Token, Binding]> = []

  export function configure<T>(token: Token<T>, additional: Partial<Binding>) {
    notNil(token)

    const opts = { ...additional }
    const tk = typeof token === 'object' ? token.constructor : token
    const existing = TypeRegistrar.get(tk)

    if (existing) {
      const names = existing.names

      if (opts?.names) {
        if (names.some(value => opts.names!.includes(value))) {
          throw new RepeatedInjectableConfigurationError(
            `Found repeated qualifiers for the class '${tokenStr(token)}'. Qualifiers found: ${opts.names
              .map(x => tokenStr(x))
              .join(', ')}`,
          )
        }

        names.push(...opts.names)

        opts.names = names
      } else {
        opts.names = existing.names
      }

      opts.interceptors = [...existing.interceptors, ...(additional.interceptors || [])]
    }

    const info = newBinding({ ...existing, ...opts })
    const entry = _entries.get(tk)

    if (entry) {
      _entries.set(tk, { ...entry, ...info })
    } else {
      _entries.set(tk, newBinding(info))
    }
  }

  export function addBean<T>(token: Token<T>, binding: Binding<T>) {
    notNil(token)
    notNil(binding)

    _beans.push([token, binding])
  }

  export function deleteBean(token: Token) {
    notNil(token)

    const idx = _beans.findIndex(([k]) => k === token)

    if (idx > -1) {
      _beans.splice(idx, 1)
    }
  }

  export function get<T>(ctor: Token<T>) {
    return _entries.get(notNil(ctor))
  }

  export function entries(): IterableIterator<[Token, Binding]> {
    return _entries.entries()
  }

  export function beans(): Array<[Token, Binding]> {
    return _beans
  }

  export function remove(token: Token): boolean {
    return _entries.delete(notNil(token))
  }
}
