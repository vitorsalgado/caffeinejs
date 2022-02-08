import { DecoratedInjectables } from '../DecoratedInjectables.js'

export function PreDestroy(): MethodDecorator {
  return function (target, propertyKey) {
    DecoratedInjectables.instance().configure(target.constructor, { preDestroy: propertyKey })
  }
}
