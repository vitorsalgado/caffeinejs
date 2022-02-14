import { DI } from '../DI.js'
import { InvalidBindingError } from '../DiError.js'
import { isNamedToken } from '../Token.js'
import { Token } from '../Token.js'
import { getInjectableMethods } from '../utils/getInjectableMethods.js'
import { getParamTypes } from '../utils/getParamTypes.js'
import { getInjectableProperties } from '../utils/getInjectableProperties.js'
import { isNil } from '../utils/isNil.js'
import { configureBean } from './utils/beanUtils.js'

export function Injectable<T>(token?: Token) {
  return function <TFunction extends Function>(target: TFunction | object, propertyKey?: string | symbol) {
    if (typeof target === 'function') {
      if (token !== undefined && !isNamedToken(token)) {
        throw new InvalidBindingError(
          '@Injectable or @Bean when used on class level only accepts injection named qualifiers of type string or symbol. ' +
            `Check class '${target.name}' decorators.`
        )
      }

      DI.configureType<T>(target, {
        injections: getParamTypes(target),
        injectableProperties: getInjectableProperties(target),
        injectableMethods: getInjectableMethods(target),
        names: token ? [token] : undefined
      })

      return
    }

    if (isNil(token)) {
      throw new InvalidBindingError(
        '@Injectable or @Bean when used on @Configuration classes method level, must receive a valid token. Current value is null or undefined. ' +
          `Check decorators on method '${String(propertyKey)}' from class '${target.constructor.name}'`
      )
    }

    configureBean(target.constructor, propertyKey!, {
      dependencies: getParamTypes(target, propertyKey),
      token
    })
  }
}
