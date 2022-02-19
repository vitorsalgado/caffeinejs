import { Identifier } from './internal/types/Identifier.js'
import { Lifecycle } from './Lifecycle.js'
import { MetadataReader } from './MetadataReader.js'

export interface Options {
  namespace: Identifier
  scopeId: Identifier
  lazy?: boolean
  lateBind?: boolean
  overriding?: boolean
  metadataReader?: MetadataReader
}

export const InitialOptions: Options = {
  namespace: '',
  scopeId: Lifecycle.SINGLETON
}
