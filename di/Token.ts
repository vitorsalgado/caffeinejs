import { AbstractCtor } from './internal/types/AbstractCtor.js'
import { Ctor } from './internal/types/Ctor.js'
import { DeferredCtor } from './internal/DeferredCtor.js'

export type Token<T = any> = Ctor<T> | DeferredCtor<T> | AbstractCtor<T> | string | symbol | Function

export interface TokenSpec<T = any> {
  token: Token<T>
  tokenType: Token<T>
  multiple?: boolean
  optional?: boolean
}

export function isNamedToken(dep: unknown): dep is string | symbol {
  return typeof dep === 'string' || typeof dep === 'symbol'
}

export function tokenStr(token: Token): string {
  return typeof token === 'function' ? token.name : token.toString()
}
