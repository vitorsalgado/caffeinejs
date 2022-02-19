import { TypeRegistrar } from '../internal/TypeRegistrar.js'

export function PostConstruct(): MethodDecorator {
  return function (target, propertyKey) {
    TypeRegistrar.configure(target.constructor, { postConstruct: propertyKey })
  }
}
