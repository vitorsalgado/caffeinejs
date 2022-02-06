import { isNil } from '../../checks/isNil.js'
import { ClazzDecorator } from '../../types/ClazzDecorator.js'
import { Ctor } from '../../types/Ctor.js'
import { DI } from '../DI.js'
import { DiVars } from '../DiVars.js'
import { Identifier } from '../Identifier.js'
import { FactoryProvider } from '../internal/FactoryProvider.js'
import { ResolutionContext } from '../ResolutionContext.js'
import { Resolver } from '../Resolver.js'
import { getParamTypes } from '../utils/getParamTypes.js'
import { ConfigurationProviderOptions } from './ConfigurationProviderOptions.js'

export interface ConfigurationOptions {
  namespace: Identifier
  lazy: boolean
  primary: boolean
  scopeId: Identifier
  late: boolean
  resolutionContext: ResolutionContext
}

export function Configuration<T>(config: Partial<ConfigurationOptions> = {}): ClazzDecorator<T> {
  return function (target) {
    DI.configureInjectable<T>(target, { dependencies: getParamTypes(target), namespace: config.namespace })

    const factories: Map<string | symbol, ConfigurationProviderOptions> =
      Reflect.getOwnMetadata(DiVars.BEAN_METHOD, target) || new Map()

    for (const [method, factory] of factories) {
      DI.configureInjectable(factory.token as Ctor, {
        names: factory.name ? [factory.name] : [],
        dependencies: factory.dependencies,
        namespace: config.namespace,
        lazy: isNil(config.lazy) ? factory.lazy : config.lazy,
        primary: isNil(config.primary) ? factory.primary : config.primary,
        scopeId: isNil(config.scopeId) ? factory.scopeId : config.scopeId,
        late: isNil(config.late) ? factory.late : config.late,
        provider: new FactoryProvider(({ di }) => {
          const clazz = di.get<{ [key: symbol | string]: (...args: unknown[]) => T }>(target, config.resolutionContext)
          const deps = factory.dependencies.map(dep =>
            Resolver.resolveParam(di, factory.token, dep, config.resolutionContext || ResolutionContext.INSTANCE)
          )

          return clazz[method](...deps)
        })
      })
    }
  }
}
