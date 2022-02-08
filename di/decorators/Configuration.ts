import { isNil } from '../utils/isNil.js'
import { ClazzDecorator } from '../internal/types/ClazzDecorator.js'
import { newBinding } from '../Binding.js'
import { DI } from '../DI.js'
import { RepeatedBeanNamesConfigurationError } from '../DiError.js'
import { DiVars } from '../DiVars.js'
import { Identifier } from '../Identifier.js'
import { FactoryProvider } from '../internal/FactoryProvider.js'
import { ResolutionContext } from '../ResolutionContext.js'
import { Resolver } from '../Resolver.js'
import { isNamedToken } from '../Token.js'
import { Token } from '../Token.js'
import { tokenStr } from '../Token.js'
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
    DI.configureDecoratedType<T>(target, {
      dependencies: getParamTypes(target),
      namespace: config.namespace,
      configuration: true
    })

    const factories: Map<string | symbol, ConfigurationProviderOptions> =
      Reflect.getOwnMetadata(DiVars.CONFIGURATION_PROVIDER, target) || new Map()
    const configurations = Array.from(factories.entries()).map(([_, options]) => options)
    const tokens = configurations.map(x => x.token)
    const dupTokens = new Set<Token>()
    const dupNames = new Set<Identifier>()

    for (const [, configuration] of factories) {
      if (dupTokens.has(configuration.token)) {
        if (isNamedToken(configuration.token)) {
          throw new RepeatedBeanNamesConfigurationError(target, tokenStr(configuration.token))
        }
      }

      if (configuration.name) {
        if (dupNames.has(configuration.name)) {
          throw new RepeatedBeanNamesConfigurationError(target, tokenStr(configuration.token))
        }

        dupNames.add(configuration.name)
      }

      dupTokens.add(configuration.token)
    }

    Reflect.defineMetadata(DiVars.CONFIGURATION_TOKENS_PROVIDED, tokens, target)

    for (const [method, factory] of factories) {
      const options = newBinding({
        dependencies: [...factory.dependencies],
        namespace: config.namespace,
        lazy: isNil(config.lazy) ? factory.lazy : config.lazy,
        primary: isNil(config.primary) ? factory.primary : config.primary,
        scopeId: isNil(config.scopeId) ? factory.scopeId : config.scopeId,
        late: isNil(config.late) ? factory.late : config.late,
        conditionals: [...factory.conditionals],
        provider: new FactoryProvider(({ di }) => {
          const clazz = di.get<{ [key: symbol | string]: (...args: unknown[]) => T }>(target, config.resolutionContext)
          const deps = factory.dependencies.map((dep, index) =>
            Resolver.resolveParam(di, factory.token, dep, index, config.resolutionContext || ResolutionContext.INSTANCE)
          )

          return clazz[method](...deps)
        })
      })

      if (factory.name) {
        options.names = [factory.name]

        if (typeof factory.token === 'function') {
          options.type = factory.token
        }

        DI.addBean(factory.name, { ...options })
      } else {
        DI.addBean(factory.token, { ...options })
      }
    }
  }
}
