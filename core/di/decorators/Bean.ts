import { Token } from '../Token.js'
import { getParamTypes } from '../utils/getParamTypes.js'
import { defineBean } from './utils/beanUtils.js'

export function Bean<T>(token: Token<T>): MethodDecorator {
  return (target, propertyKey) => {
    defineBean(target.constructor, propertyKey, {
      dependencies: getParamTypes(target, propertyKey),
      token
    })
  }
}
