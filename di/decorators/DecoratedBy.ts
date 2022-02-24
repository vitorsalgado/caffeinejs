import { TypeRegistrar } from '../internal/TypeRegistrar.js'
import { configureBean } from '../internal/utils/beanUtils.js'
import { DecorateInterceptor } from '../internal/interceptors/DecorateInterceptor.js'
import { Token } from '../Token.js'

export function DecoratedBy<T>(clazz: Token) {
  return function <TFunction extends Function>(target: TFunction | object, propertyKey?: string | symbol) {
    if (typeof target === 'function') {
      TypeRegistrar.configure<T>(target, {
        interceptors: [new DecorateInterceptor(clazz)],
      })
      return
    }

    configureBean(target.constructor, propertyKey!, {
      interceptors: [new DecorateInterceptor(clazz)],
    })
  }
}
