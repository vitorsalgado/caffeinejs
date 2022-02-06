import { ClazzDecorator } from '../../types/ClazzDecorator.js'
import { Ctor } from '../../types/Ctor.js'
import { DI } from '../DI.js'
import { DiVars } from '../DiVars.js'
import { FactoryProvider } from '../internal/FactoryProvider.js'
import { ConfigurationProviderOptions } from './ConfigurationProviderOptions.js'
import { Injectable } from './Injectable.js'

export function Configuration<T>(): ClazzDecorator<T> {
  return function (target) {
    Injectable()(target)

    const factories: Map<string | symbol, ConfigurationProviderOptions> =
      Reflect.getOwnMetadata(DiVars.BEAN_METHOD, target) || []

    for (const [method, factory] of factories) {
      DI.configureInjectable(factory.token as Ctor, {
        names: factory.name ? [factory.name] : [],
        provider: new FactoryProvider(({ di }) => {
          const clazz = di.get<{ [key: symbol | string]: (...args: unknown[]) => T }>(target)
          const deps = factory.dependencies.map(dep => (dep.multiple ? di.getMany(dep.token) : di.get(dep.token)))

          return clazz[method](...deps)
        }),
        dependencies: factory.dependencies
      })
    }
  }
}
