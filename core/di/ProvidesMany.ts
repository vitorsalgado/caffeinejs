import { DiMetadata } from './DiMetadata.js'
import { FactoryOptions } from './Provides.js'
import { Token } from './Token.js'
import { getParamTypes } from './utils/getParamTypes.js'

export function ProvidesMany<T>(token: Token<T>): MethodDecorator {
  return (target, propertyKey, _descriptor) => {
    const dependencies: unknown[] = getParamTypes(target.constructor)
    const factories: FactoryOptions[] = Reflect.getOwnMetadata(DiMetadata.FACTORIES, target.constructor) || []

    Reflect.defineMetadata(
      DiMetadata.FACTORIES,
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
