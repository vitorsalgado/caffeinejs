import { Binding } from '../Binding.js'
import { DiVars } from '../DiVars.js'
import { Token } from '../Token.js'

export interface MetadataReader {
  read(token: Token): Partial<Binding>
}

export class InternalMetadataReader implements MetadataReader {
  read(token: Token): Partial<Binding> {
    return Reflect.getOwnMetadata(DiVars.CLASS_METADATA, token) || {}
  }
}
