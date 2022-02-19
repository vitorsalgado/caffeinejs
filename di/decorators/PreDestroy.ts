import { DiTypes } from '../internal/DiTypes.js'

export function PreDestroy(): MethodDecorator {
  return function (target, propertyKey) {
    DiTypes.configure(target.constructor, { preDestroy: propertyKey })
  }
}
