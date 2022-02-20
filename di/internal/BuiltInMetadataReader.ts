import { Binding } from '../Binding.js'
import { TokenSpec } from '../Token.js'
import { MetadataReader } from '../MetadataReader.js'
import { Keys } from '../Keys.js'

export class BuiltInMetadataReader implements MetadataReader {
  read(token: any): Partial<Binding> {
    if (typeof token === 'function') {
      const symbols = Object.getOwnPropertySymbols(token)
      const kDeps = symbols.find(x => x === Keys.kDeps)

      if (kDeps) {
        const deps = token[kDeps]
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
