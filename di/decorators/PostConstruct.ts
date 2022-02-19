import { DiTypes } from '../internal/DiTypes.js'

export function PostConstruct(): MethodDecorator {
  return function (target, propertyKey) {
    DiTypes.instance().configure(target.constructor, { postConstruct: propertyKey })
  }
}
