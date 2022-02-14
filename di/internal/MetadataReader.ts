import { Binding } from '../Binding.js'
import { Token } from '../Token.js'
import { Vars } from './Vars.js'

export interface MetadataReader {
  read(token: Token): Partial<Binding>
}

export class InternalMetadataReader implements MetadataReader {
  read(token: Token): Partial<Binding> {
    return Reflect.getOwnMetadata(Vars.CLASS_METADATA, token) || {}
  }
}
