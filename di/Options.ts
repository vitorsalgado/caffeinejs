import { Lifecycle } from './Lifecycle.js'
import { MetadataReader } from './MetadataReader.js'
import { Identifier } from './internal/types.js'

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
