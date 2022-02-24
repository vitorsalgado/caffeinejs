import { Binding } from '../Binding.js'
import { InvalidBindingError } from '../internal/errors.js'
import { isNamedToken } from '../Token.js'
import { Token } from '../Token.js'
import { getInjectableMethods } from '../internal/utils/getInjectableMethods.js'
import { getInjectableProperties } from '../internal/utils/getInjectableProperties.js'
import { getParamTypes } from '../internal/utils/getParamTypes.js'
import { isNil } from '../internal/utils/isNil.js'
import { configureBean } from '../internal/utils/beanUtils.js'
import { getLookupProperties } from '../internal/utils/getLookupProperties.js'
import { TypeRegistrar } from '../internal/TypeRegistrar.js'
import { BagArgsClassProvider } from '../internal/providers/BagArgsClassProvider.js'
import { Ctor } from '../internal/types.js'

export function Injectable<T>(token?: Token) {
  return function <TFunction extends Function>(target: TFunction | object, propertyKey?: string | symbol) {
    if (typeof target === 'function') {
      if (token !== undefined && !isNamedToken(token)) {
        throw new InvalidBindingError(
          `@Injectable or @Bean when used on class level only accepts injection named qualifiers of type string or symbol. ` +
            `Received: ${typeof token}. ` +
            `Check decorator on class '${target.name}'.`,
        )
      }

      const injections = getParamTypes(target)

      TypeRegistrar.configure<T>(target, {
        injections,
        injectableProperties: getInjectableProperties(target),
        injectableMethods: getInjectableMethods(target),
        lookupProperties: getLookupProperties(target),
        type: target,
        names: token ? [token] : undefined,
        rawProvider: injections.some(x => x.bag && x.bag.length > 0)
          ? new BagArgsClassProvider(target as Ctor)
          : undefined,
      } as Partial<Binding>)

      return
    }

    if (isNil(token)) {
      throw new InvalidBindingError(
        `@Injectable or @Bean when used on @Configuration classes method level, must receive a valid token. Current value is: ${String(
          token,
        )}. Check the decorators on method '${String(propertyKey)}' from class '${target.constructor.name}'`,
      )
    }

    const type = typeof token === 'function' ? token : undefined

    configureBean(target.constructor, propertyKey!, {
      dependencies: getParamTypes(target, propertyKey),
      token,
      type,
    } as Partial<Binding>)
  }
}
