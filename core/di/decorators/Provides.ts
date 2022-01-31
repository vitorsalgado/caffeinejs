import { DiMetadata } from '../DiMetadata.js'
import { Token } from '../Token.js'
import { getParamTypes } from '../utils/getParamTypes.js'
import { ConfigurationProviderOptions } from './ConfigurationProviderOptions.js'

export function Provides<T>(token: Token<T>): MethodDecorator {
  return (target, propertyKey, _descriptor) => {
    const dependencies: unknown[] = getParamTypes(target, propertyKey)
    const factories: ConfigurationProviderOptions[] =
      Reflect.getOwnMetadata(DiMetadata.FACTORIES, target.constructor) || []

    Reflect.defineMetadata(
      DiMetadata.FACTORIES,
      [
        ...factories,
        {
          token,
          dependencies,
          method: propertyKey
        }
      ],
      target.constructor
    )
  }
}
