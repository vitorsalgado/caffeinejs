import { Vars } from '../internal/Vars.js'
import { InvalidBindingError } from '../internal/index.js'
import { InvalidInjectionToken } from '../internal/index.js'
import { Token } from '../Token.js'
import { TokenSpec } from '../Token.js'
import { isValidToken } from '../Token.js'
import { notNil } from '../internal/utils/notNil.js'

export interface LookupOptions {
  multiple?: boolean
  optional?: boolean
}

export function Lookup(token?: Token, options?: LookupOptions): MethodDecorator {
  return function (target, propertyKey, descriptor) {
    if (typeof descriptor.get !== 'function') {
      notNil(
        token,
        `@Lookup() on property key '${String(propertyKey)}' at class '${
          target.constructor.name
        }' must not be null or undefined.`
      )
    }

    const type = Reflect.getMetadata('design:type', target, propertyKey)
    const injectionToken: Token = token ? token : type
    const lookupProperties: Record<string | symbol, TokenSpec> =
      Reflect.getOwnMetadata(Vars.CLASS_LOOKUP_PROPERTIES, target.constructor) || []

    if (lookupProperties[propertyKey]) {
      throw new InvalidBindingError(
        `@Lookup() already added on property '${String(propertyKey)}' at class '${target.constructor.name}'.`
      )
    }

    if (!isValidToken(injectionToken)) {
      throw new InvalidInjectionToken(
        `@Lookup() decorator on property '${String(propertyKey)}' at class '${
          target.constructor.name
        }' doesn't contain a valid injection token. Value is typeof ${typeof injectionToken}. ` +
          `It must be a class ref, string or symbol.`
      )
    }

    lookupProperties[propertyKey] = { ...options, token: injectionToken, tokenType: type }

    Reflect.defineMetadata(Vars.CLASS_LOOKUP_PROPERTIES, lookupProperties, target.constructor)
  }
}
