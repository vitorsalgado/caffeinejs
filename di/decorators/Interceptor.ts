import { PostResolutionInterceptor } from '../PostResolutionInterceptor.js'
import { ResolutionContext } from '../ResolutionContext.js'
import { TypeRegistrar } from '../internal/TypeRegistrar.js'
import { configureBean } from '../internal/utils/beanUtils.js'
import { notNil } from '../internal/utils/notNil.js'
import { FunctionPostResolutionInterceptor } from '../internal/interceptors/FunctionPostResolutionInterceptor.js'

export function Interceptor<T>(
  interceptor: PostResolutionInterceptor<T> | ((instance: T, ctx: ResolutionContext) => T),
) {
  return function <TFunction extends Function>(target: TFunction | object, propertyKey?: string | symbol) {
    const parsed = notNil(
      typeof interceptor === 'function' ? new FunctionPostResolutionInterceptor(interceptor) : interceptor,
    )

    if (typeof target === 'function') {
      TypeRegistrar.configure<T>(target, {
        interceptors: [parsed],
      })
      return
    }

    configureBean(target.constructor, propertyKey!, {
      interceptors: [parsed],
    })
  }
}
