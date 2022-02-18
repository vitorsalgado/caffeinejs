import { DI } from '../DI.js'
import { Token } from '../Token.js'
import { Binding } from '../Binding.js'
import { LocalResolutions } from '../LocalResolutions.js'

export interface ResolutionContext {
  di: DI
  token: Token
  binding: Binding
  localResolutions: LocalResolutions
}
