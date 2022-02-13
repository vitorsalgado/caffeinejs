import { DecoratedInjectables } from '../DecoratedInjectables.js'

export function AfterResolution(): MethodDecorator {
  return function (target, propertyKey) {
    DecoratedInjectables.instance().configure(target.constructor, { afterResolution: propertyKey })
  }
}
