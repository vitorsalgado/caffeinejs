import { Vars } from '../Vars.js'
import { TokenSpec } from '../../Token.js'
import { getParamTypes } from './getParamTypes.js'

export function configureInjectionMetadata(
  tokenSpec: Partial<TokenSpec<unknown>>,
): <TFunction>(target: TFunction, propertyKey: string | symbol, parameterIndex?: number | PropertyDescriptor) => void {
  return function (target: any, propertyKey: string | symbol, parameterIndex?: number | PropertyDescriptor): void {
    // Parameter decorator
    // --
    if (typeof parameterIndex === 'number') {
      const descriptors: Record<number, TokenSpec<unknown>> = (typeof target === 'function'
        ? Reflect.getOwnMetadata(Vars.CLASS_CTOR_INJECTION_TOKENS, target)
        : Reflect.getOwnMetadata(Vars.CLASS_CTOR_INJECTION_TOKENS, target.constructor, propertyKey)) || {}

      if (descriptors[parameterIndex]) {
        descriptors[parameterIndex] = { ...descriptors[parameterIndex], ...tokenSpec }
      } else {
        descriptors[parameterIndex] = tokenSpec as TokenSpec<unknown>
      }

      if (propertyKey) {
        Reflect.defineMetadata(Vars.CLASS_CTOR_INJECTION_TOKENS, descriptors, target.constructor, propertyKey)
      } else {
        Reflect.defineMetadata(Vars.CLASS_CTOR_INJECTION_TOKENS, descriptors, target)
      }

      return
    }

    // Method decorator
    // Setter method injection
    // --
    if (parameterIndex !== undefined && 'value' in parameterIndex) {
      const paramTypes = getParamTypes(target, propertyKey)
      const setterMethods = Reflect.getOwnMetadata(Vars.CLASS_SETTER_METHODS, target.constructor) || []

      setterMethods.push(propertyKey)

      Reflect.defineMetadata(Vars.CLASS_SETTER_METHODS, setterMethods, target.constructor)
      Reflect.defineMetadata(Vars.CLASS_SETTER_METHODS_TOKENS, paramTypes, target.constructor, propertyKey)

      return
    }

    // Property decorator
    // --
    const tokenType = Reflect.getMetadata('design:type', target, propertyKey)
    const token = tokenSpec.token ? tokenSpec.token : tokenType
    const descriptors: Record<string | symbol, TokenSpec<unknown>> = Reflect.getOwnMetadata(
      Vars.CLASS_PROPERTIES_INJECTION_TOKENS,
      target.constructor,
    ) || {}

    descriptors[propertyKey] = { ...descriptors[propertyKey], ...tokenSpec, token, tokenType }

    Reflect.defineMetadata(Vars.CLASS_PROPERTIES_INJECTION_TOKENS, descriptors, target.constructor)

    return
  }
}
