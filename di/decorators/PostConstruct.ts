import { DecoratedInjectables } from '../DecoratedInjectables.js'

export function PostConstruct(): MethodDecorator {
  return function (target, propertyKey) {
    DecoratedInjectables.instance().configure(target.constructor, { postConstruct: propertyKey })
  }
}
