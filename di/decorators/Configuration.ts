import { newBinding } from '../Binding.js'
import { DI } from '../DI.js'
import { RepeatedNamesError } from '../internal/DiError.js'
import { Ctor } from '../internal/types/Ctor.js'
import { Vars } from '../internal/Vars.js'
import { Identifier } from '../internal/types/Identifier.js'
import { BeanFactoryProvider } from '../internal/BeanFactoryProvider.js'
import { isNamedToken } from '../Token.js'
import { Token } from '../Token.js'
import { tokenStr } from '../Token.js'
import { getParamTypes } from '../internal/utils/getParamTypes.js'
import { isNil } from '../internal/utils/isNil.js'
import { ConfigurationProviderOptions } from '../internal/index.js'

export interface ConfigurationOptions {
  namespace: Identifier
  lazy: boolean
  primary: boolean
  scopeId: Identifier
  late: boolean
}

export function Configuration<T>(config: Partial<ConfigurationOptions> = {}): ClassDecorator {
  return function (target) {
    DI.configureType<T>(target, {
      injections: getParamTypes(target),
      namespace: config.namespace,
      configuration: true
    })

    const beanConfiguration: Map<string | symbol, ConfigurationProviderOptions> =
      Reflect.getOwnMetadata(Vars.CONFIGURATION_PROVIDER, target) || new Map()
    const configurations = Array.from(beanConfiguration.entries()).map(([_, options]) => options)
    const tokens = configurations.map(x => x.token)
    const dupTokens = new Set<Token>()
    const dupNames = new Set<Identifier>()

    for (const [, configuration] of beanConfiguration) {
      if (dupTokens.has(configuration.token)) {
        if (isNamedToken(configuration.token)) {
          throw new RepeatedNamesError(
            `Found multiple injectables with the name '${tokenStr(configuration.token)}' at the configuration class '${
              target.name
            }'`
          )
        }
      }

      if (configuration.name) {
        if (dupNames.has(configuration.name)) {
          throw new RepeatedNamesError(
            `Found multiple injectables with the name '${tokenStr(configuration.token)}' at the configuration class '${
              target.name
            }'`
          )
        }

        dupNames.add(configuration.name)
      }

      dupTokens.add(configuration.token)
    }

    Reflect.defineMetadata(Vars.CONFIGURATION_TOKENS_PROVIDED, tokens, target)

    for (const [method, factory] of beanConfiguration) {
      const binding = newBinding({
        injections: [...factory.dependencies],
        namespace: config.namespace,
        lazy: isNil(config.lazy) ? factory.lazy : config.lazy,
        primary: isNil(config.primary) ? factory.primary : config.primary,
        scopeId: isNil(config.scopeId) ? factory.scopeId : config.scopeId,
        late: isNil(config.late) ? factory.late : config.late,
        conditionals: [...factory.conditionals],
        rawProvider: new BeanFactoryProvider(target as unknown as Ctor<T>, method, factory)
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
