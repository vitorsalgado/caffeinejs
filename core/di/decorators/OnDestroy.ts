import { DecoratedInjectables } from '../DecoratedInjectables.js'

export function OnDestroy(): MethodDecorator {
  return function (target, propertyKey) {
    DecoratedInjectables.instance().configure(target.constructor, { onDestroy: propertyKey })
  }
}
