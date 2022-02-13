import { Identifier } from '../Identifier.js'
import { ResolutionContext } from '../ResolutionContext.js'

export interface ConfigurationOptions {
  namespace: Identifier
  lazy: boolean
  primary: boolean
  scopeId: Identifier
  late: boolean
  resolutionContext: ResolutionContext
}
