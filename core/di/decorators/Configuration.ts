import { ClazzDecorator } from '../../types/ClazzDecorator.js'
import { Ctor } from '../../types/Ctor.js'
import { DI } from '../DI.js'
import { DiMetadata } from '../DiMetadata.js'
import { ConfigurationProviderOptions } from './ConfigurationProviderOptions.js'
import { Injectable } from './Injectable.js'

export function Configuration<T>(): ClazzDecorator<T> {
  return function (target) {
    Injectable()(target)

    const factories: ConfigurationProviderOptions[] = Reflect.getOwnMetadata(DiMetadata.FACTORIES, target) || []

    for (const factory of factories) {
      DI.configureInjectable(factory.token as Ctor, {
        provider: {
          useFactory: ({ di }) => {
            const clazz = di.get<{ [key: symbol | string]: (...args: unknown[]) => T }>(target)
            const deps = factory.dependencies.map(dep => (dep.multiple ? di.getMany(dep.token) : di.get(dep.token)))

            return clazz[factory.method](...deps)
          }
        },
        dependencies: factory.dependencies
      })
    }
  }
}
