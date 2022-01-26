import { DiMetadata } from './DiMetadata.js'
import { TokenSpec } from './Token.js'
import { Token } from './Token.js'

export interface FactoryOptions {
  token: Token<unknown>
  dependencies: TokenSpec<unknown>[]
  method: string | symbol
}

export function Provides<T>(token: Token<T>): MethodDecorator {
  return (target, propertyKey, _descriptor) => {
    const dependencies: unknown[] = Reflect.getMetadata('design:paramtypes', target, propertyKey) || []
    const factories: FactoryOptions[] = Reflect.getOwnMetadata(DiMetadata.FACTORIES, target.constructor) || []

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
