import { DeferredCtor } from './internal/DeferredCtor.js'
import { AbstractCtor } from './internal/types.js'
import { Ctor } from './internal/types.js'

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

export function isValidToken(token: Token): boolean {
  return token !== undefined && token !== null && (isNamedToken(token) || typeof token === 'function')
}
