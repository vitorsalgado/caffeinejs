import { newBinding } from '../Binding.js'
import { DI } from '../DI.js'
import { RepeatedBeanNamesConfigurationError } from '../DiError.js'
import { DiVars } from '../DiVars.js'
import { Identifier } from '../Identifier.js'
import { BeanFactoryProvider } from '../internal/BeanFactoryProvider.js'
import { ClazzDecorator } from '../internal/types/ClazzDecorator.js'
import { isNamedToken } from '../Token.js'
import { Token } from '../Token.js'
import { tokenStr } from '../Token.js'
import { getParamTypes } from '../utils/getParamTypes.js'
import { isNil } from '../utils/isNil.js'
import { ConfigurationOptions } from './ConfigurationOptions.js'
import { ConfigurationProviderOptions } from './ConfigurationProviderOptions.js'

export function Configuration<T>(config: Partial<ConfigurationOptions> = {}): ClazzDecorator<T> {
  return function (target) {
    DI.configureDecoratedType<T>(target, {
      dependencies: getParamTypes(target),
      namespace: config.namespace,
      configuration: true
    })

    const beanConfiguration: Map<string | symbol, ConfigurationProviderOptions> =
      Reflect.getOwnMetadata(DiVars.CONFIGURATION_PROVIDER, target) || new Map()
    const configurations = Array.from(beanConfiguration.entries()).map(([_, options]) => options)
    const tokens = configurations.map(x => x.token)
    const dupTokens = new Set<Token>()
    const dupNames = new Set<Identifier>()

    for (const [, configuration] of beanConfiguration) {
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

    for (const [method, factory] of beanConfiguration) {
      const binding = newBinding({
        dependencies: [...factory.dependencies],
        namespace: config.namespace,
        lazy: isNil(config.lazy) ? factory.lazy : config.lazy,
        primary: isNil(config.primary) ? factory.primary : config.primary,
        scopeId: isNil(config.scopeId) ? factory.scopeId : config.scopeId,
        late: isNil(config.late) ? factory.late : config.late,
        conditionals: [...factory.conditionals],
        rawProvider: new BeanFactoryProvider(target, method, factory)
      })

      if (factory.name) {
        binding.names = [factory.name]

        if (typeof factory.token === 'function') {
          binding.type = factory.token
        }

        DI.addBean(factory.name, { ...binding })
      } else {
        DI.addBean(factory.token, { ...binding })
      }
    }
  }
}
