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
            const deps = factory.dependencies.map(dep =>
              dep.multiple ? di.resolveAll(dep.token) : di.resolve(dep.token)
            )
            const configuration = di.resolve<{ [key: symbol | string]: (...args: unknown[]) => T }>(target)

            return configuration[factory.method](...deps)
          }
        },
        dependencies: factory.dependencies
      })
    }
  }
}
