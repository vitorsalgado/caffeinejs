import { Binding } from '../Binding.js'
import { DI } from '../DI.js'
import { InvalidBindingError } from '../DiError.js'
import { isNamedToken } from '../Token.js'
import { Token } from '../Token.js'
import { getInjectableMethods } from '../utils/getInjectableMethods.js'
import { getInjectableProperties } from '../utils/getInjectableProperties.js'
import { getParamTypes } from '../utils/getParamTypes.js'
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

      const i = getParamTypes(target)

      DI.configureType<T>(target, {
        injections: getParamTypes(target),
        injectableProperties: getInjectableProperties(target),
        injectableMethods: getInjectableMethods(target),
        type: target,
        names: token ? [token] : undefined
      } as Partial<Binding>)

      return
    }

    if (isNil(token)) {
      throw new InvalidBindingError(
        '@Injectable or @Bean when used on @Configuration classes method level, must receive a valid token. Current value is null or undefined. ' +
          `Check decorators on method '${String(propertyKey)}' from class '${target.constructor.name}'`
      )
    }

    const type = typeof token === 'function' ? token : undefined

    configureBean(target.constructor, propertyKey!, {
      dependencies: getParamTypes(target, propertyKey),
      token,
      type
    } as Partial<Binding>)
  }
}
