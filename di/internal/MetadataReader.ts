import { Binding } from '../Binding.js'
import { Token } from '../Token.js'

export interface MetadataReader {
  read(token: Token): Partial<Binding>
}
