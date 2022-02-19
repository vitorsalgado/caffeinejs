import { Token } from './Token.js'
import { Binding } from './Binding.js'

export interface MetadataReader {
  read(token: Token): Partial<Binding>
}
