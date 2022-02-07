import { Conditional } from './Conditional.js'
import { DecoratedInjectables } from './DecoratedInjectables.js'
import { getBeanConfiguration } from './decorators/utils/beanUtils.js'
import { configureBean } from './decorators/utils/beanUtils.js'
import { DI } from './DI.js'
import { getParamTypes } from './utils/getParamTypes.js'

export function ConditionalOn<T>(...conditionals: Conditional[]) {
  return function <TFunction extends Function>(target: TFunction | object, propertyKey?: string | symbol) {
    const cond: Conditional[] = [...conditionals]

    if (typeof target === 'function') {
      const injectable = DecoratedInjectables.instance().get(target)

      if (injectable && injectable.conditionals) {
        cond.push(...injectable.conditionals)
      }

      DI.configureInjectable<T>(target, { dependencies: getParamTypes(target), conditionals: cond })
      return
    }

    const config = getBeanConfiguration(target.constructor, propertyKey!)

    if (config.conditionals) {
      cond.push(...config.conditionals)
    }

    configureBean(target.constructor, propertyKey!, {
      dependencies: getParamTypes(target, propertyKey),
      conditionals: cond
    })
  }
}
