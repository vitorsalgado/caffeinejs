import { Binding } from '../Binding.js'
import { DiVars } from '../DiVars.js'
import { Token } from '../Token.js'

export function configureMetadata(token: Token, opts?: Partial<Binding>) {
  const current: Partial<Binding> = Reflect.getOwnMetadata(DiVars.CLASS_METADATA, token) || {}
  const changed = { ...current, ...opts }

  Reflect.defineMetadata(DiVars.CLASS_METADATA, changed, token)
}
