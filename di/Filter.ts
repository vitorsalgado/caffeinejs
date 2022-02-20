import { Token } from './Token.js'
import { Binding } from './Binding.js'

export type Filter = (token: Token, binding: Binding) => boolean
