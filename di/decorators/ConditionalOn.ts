import { DiTypes } from '../internal/DiTypes.js'
import { configureBean, getBeanConfiguration } from '../internal/utils/beanUtils.js'
import { Container } from '../Container.js'

export interface ConditionContext {
  container: Container
}

export type Conditional = (ctx: ConditionContext) => boolean

export function ConditionalOn<T>(...conditionals: Conditional[]) {
  return function <TFunction extends Function>(target: TFunction | object, propertyKey?: string | symbol) {
    const merged: Conditional[] = [...conditionals]

    if (typeof target === 'function') {
      const injectable = DiTypes.instance().get(target)

      if (injectable && injectable.conditionals) {
        merged.push(...injectable.conditionals)
      }

      DiTypes.instance().configure<T>(target, { conditionals: merged })

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
