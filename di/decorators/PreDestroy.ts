import { DiTypes } from '../DiTypes.js'

export function PreDestroy(): MethodDecorator {
  return function (target, propertyKey) {
    DiTypes.instance().configure(target.constructor, { preDestroy: propertyKey })
  }
}
