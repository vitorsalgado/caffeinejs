import { Identifier } from '../internal/types/Identifier.js'

export interface ConfigurationOptions {
  namespace: Identifier
  lazy: boolean
  primary: boolean
  scopeId: Identifier
  late: boolean
}
