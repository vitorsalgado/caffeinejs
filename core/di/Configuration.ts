import { ClazzDecorator } from '../types/ClazzDecorator.js'
import { Ctor } from '../types/Ctor.js'
import { DI } from './DI.js'
import { DiMetadata } from './DiMetadata.js'
import { Injectable } from './Injectable.js'
import { FactoryOptions } from './Provides.js'
import { isTokenSpec } from './Token.js'
import { Token } from './Token.js'

export function Configuration<T>(): ClazzDecorator<T> {
  return function (target) {
    Injectable()(target)

    const factories: FactoryOptions[] = Reflect.getOwnMetadata(DiMetadata.FACTORIES, target) || []

    for (const factory of factories) {
      DI.configureInjectable(factory.token as Ctor, {
        provider: {
          useFactory: di => {
            const deps = factory.dependencies.map(dep =>
              isTokenSpec(dep) && dep.multiple ? di.resolveAll(dep.token) : di.resolve(dep as Token<unknown>)
            )
            const configuration = di.resolve<{ [key: symbol | string]: (...args: unknown[]) => T }>(
              target as Token<any>
            )

            return configuration[factory.method](...deps)
          }
        },
        dependencies: factory.dependencies
      })
    }
  }
}
