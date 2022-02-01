import { Ctor } from '../types/Ctor.js'
import { DeferredCtor } from './DeferredCtor.js'
import { DI } from './DI.js'
import { Token } from './Token.js'
import { isNamedToken } from './Token.js'

export interface ProviderContext<T> {
  di: DI
  token: Token<T>
}

export interface ValueProvider<T> {
  useValue: T
}

export interface ClassProvider<T> {
  useClass: Ctor<T>
}

export interface FunctionProvider<T> {
  useFunction: (...args: unknown[]) => T
}

export interface NamedProvider {
  useName: string | symbol
}

export interface FactoryProvider<T> {
  useFactory: (ctx: ProviderContext<T>) => T
}

export interface DeferredProvider<T> {
  useDefer: DeferredCtor<T>
}

export default interface TokenProvider<T> {
  useToken: Token<T>
}

export type Provider<T> =
  | Ctor<T>
  | ValueProvider<T>
  | ClassProvider<T>
  | FunctionProvider<T>
  | NamedProvider
  | FactoryProvider<T>
  | DeferredProvider<T>
  | TokenProvider<T>

export function isValueProvider<T>(provider: unknown): provider is ValueProvider<T> {
  return (provider as ValueProvider<T>).useValue != undefined
}

export function isClassProvider<T>(provider: unknown): provider is ClassProvider<T> {
  return !!(provider as ClassProvider<T>).useClass
}

export function isNamedProvider(provider: unknown): provider is NamedProvider {
  return !!(provider as NamedProvider).useName
}

export function isFunctionProvider<T>(provider: unknown): provider is FunctionProvider<T> {
  return !!(provider as FunctionProvider<T>).useFunction
}

export function isFactoryProvider<T>(provider: unknown): provider is FactoryProvider<T> {
  return !!(provider as FactoryProvider<T>).useFactory
}

export function isDeferredProvider<T>(provider: unknown): provider is DeferredProvider<T> {
  return !!(provider as DeferredProvider<T>).useDefer
}

export function isTokenProvider<T>(provider: unknown): provider is TokenProvider<T> {
  return !!(provider as TokenProvider<T>).useToken
}

export function providerFromToken<T>(token: Token<T>, provider?: Provider<T>): Provider<T> | undefined {
  if (typeof provider === 'undefined') {
    if (typeof token === 'function') {
      return { useClass: token as Ctor<T> }
    } else if (isNamedToken(token)) {
      return { useName: token }
    }

    return undefined
  } else {
    return provider
  }
}
