import { DecoratedInjectables } from '../DecoratedInjectables.js'
import { DI } from '../DI.js'
import { configureBean, getBeanConfiguration } from './utils/beanUtils.js'

export interface ConditionContext {
  di: DI
}

export type Conditional = (ctx: ConditionContext) => boolean

export function ConditionalOn<T>(...conditionals: Conditional[]) {
  return function <TFunction extends Function>(target: TFunction | object, propertyKey?: string | symbol) {
    const merged: Conditional[] = [...conditionals]

    if (typeof target === 'function') {
      const injectable = DecoratedInjectables.instance().get(target)

      if (injectable && injectable.conditionals) {
        merged.push(...injectable.conditionals)
      }

      DI.configureType<T>(target, { conditionals: merged })

      return
    }

    const config = getBeanConfiguration(target.constructor, propertyKey!)

    if (config.conditionals) {
      merged.push(...config.conditionals)
    }

    configureBean(target.constructor, propertyKey!, {
      conditionals: merged
    })
  }
}
