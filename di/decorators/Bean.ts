import { Token } from '../Token.js'
import { Injectable } from './Injectable.js'

export function Bean<T>(token: Token<T>) {
  return function <TFunction extends Function>(target: TFunction | object, propertyKey?: string | symbol) {
    return Injectable(token)(target, propertyKey)
  }
}
