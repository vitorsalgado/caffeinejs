import { Token } from '../Token.js'
import { isNamedToken } from '../Token.js'
import { getParamTypes } from '../internal/utils/getParamTypes.js'
import { getInjectableProperties } from '../internal/utils/getInjectableProperties.js'
import { getInjectableMethods } from '../internal/utils/getInjectableMethods.js'
import { getLookupProperties } from '../internal/utils/getLookupProperties.js'
import { Binding } from '../Binding.js'
import { isNil } from '../internal/utils/isNil.js'
import { configureBean } from '../internal/utils/beanUtils.js'
import { InvalidBindingError } from '../internal/errors.js'
import { DiTypes } from '../internal/DiTypes.js'
import { ConfigurationProviderOptions } from './ConfigurationProviderOptions.js'

export function Bean<T>(bean: Token<T>, token?: Token) {
  return function <TFunction extends Function>(target: TFunction | object, propertyKey?: string | symbol) {
    if (typeof target === 'function') {
      if (bean !== undefined && !isNamedToken(bean)) {
        throw new InvalidBindingError(
          `@Bean when used on class level only accepts injection named qualifiers of type string or symbol. ` +
            `Received: ${typeof bean}. ` +
            `Check decorator on class '${target.name}'.`
        )
      }

      DiTypes.configure<T>(target, {
        injections: getParamTypes(target),
        injectableProperties: getInjectableProperties(target),
        injectableMethods: getInjectableMethods(target),
        lookupProperties: getLookupProperties(target),
        type: target,
        names: bean ? [bean] : undefined
      } as Partial<Binding>)

      return
    }

    if (isNil(bean)) {
      throw new InvalidBindingError(
        `@Bean when used on @Configuration classes method level, must receive a valid token. Current value is: ${String(
          bean
        )}. Check the decorators on method '${String(propertyKey)}' from class '${target.constructor.name}'`
      )
    }

    const type = typeof bean === 'function' ? bean : undefined
    const tk = typeof token === 'undefined' ? bean : token

    configureBean(target.constructor, propertyKey!, {
      dependencies: getParamTypes(target, propertyKey),
      token: tk,
      type
    } as Partial<ConfigurationProviderOptions>)
  }
}
