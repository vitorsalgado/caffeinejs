import { DiTypes } from '../DiTypes.js'

export function PostConstruct(): MethodDecorator {
  return function (target, propertyKey) {
    DiTypes.instance().configure(target.constructor, { postConstruct: propertyKey })
  }
}
