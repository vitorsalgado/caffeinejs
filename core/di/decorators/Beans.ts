import { DiVars } from '../DiVars.js'
import { Token } from '../Token.js'
import { getParamTypes } from '../utils/getParamTypes.js'
import { ConfigurationProviderOptions } from './ConfigurationProviderOptions.js'

export function Beans<T>(token: Token<T>): MethodDecorator {
  return (target, propertyKey, _descriptor) => {
    const dependencies: unknown[] = getParamTypes(target.constructor)
    const factories: ConfigurationProviderOptions[] =
      Reflect.getOwnMetadata(DiVars.BEAN_METHOD, target.constructor) || []

    Reflect.defineMetadata(
      DiVars.BEAN_METHOD,
      [
        ...factories,
        {
          token: { token, multiple: true },
          dependencies,
          method: propertyKey
        }
      ],
      target.constructor
    )
  }
}
