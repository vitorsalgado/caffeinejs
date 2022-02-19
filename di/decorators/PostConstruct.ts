import { DiTypes } from '../internal/DiTypes.js'

export function PostConstruct(): MethodDecorator {
  return function (target, propertyKey) {
    DiTypes.configure(target.constructor, { postConstruct: propertyKey })
  }
}
