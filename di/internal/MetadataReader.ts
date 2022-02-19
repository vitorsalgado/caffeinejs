import { Binding } from '../Binding.js'
import { Token } from '../Token.js'
import { TokenSpec } from '../Token.js'

export interface MetadataReader {
  read(token: Token): Partial<Binding>
}

export class InternalMetadataReader implements MetadataReader {
  read(token: any): Partial<Binding> {
    if (typeof token === 'function') {
      const kDeps = Object.getOwnPropertySymbols(token)

      if (kDeps.length === 1) {
        const deps = token[kDeps[0]]
        const injections: TokenSpec[] = []

        for (const dep of deps) {
          if (typeof dep === 'object') {
            injections.push(dep)
          } else {
            injections.push({ token: dep, tokenType: dep })
          }
        }

        if (injections) {
          return { injections }
        }
      }
    }

    return {}
  }
}
