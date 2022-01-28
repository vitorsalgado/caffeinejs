import { AbstractCtor } from '../types/AbstractCtor.js'
import { Ctor } from '../types/Ctor.js'
import { DeferredCtor } from './DeferredCtor.js'

export type Token<T> = Ctor<T> | DeferredCtor<T> | AbstractCtor<T> | string | symbol

export interface TokenSpec<T> {
  token: Token<T>
  multiple?: boolean
}

export function isTokenSpec<T>(spec: unknown): spec is TokenSpec<T> {
  return spec !== null && typeof spec === 'object' && 'token' in spec
}

export function isNamedToken(dep: unknown): dep is string | symbol {
  return typeof dep === 'string' || typeof dep === 'symbol'
}
