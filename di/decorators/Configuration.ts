import { newBinding } from '../Binding.js'
import { DI } from '../DI.js'
import { Ctor } from '../internal/types/Ctor.js'
import { Vars } from '../internal/Vars.js'
import { Identifier } from '../internal/types/Identifier.js'
import { BeanFactoryProvider } from '../internal/BeanFactoryProvider.js'
import { getParamTypes } from '../internal/utils/getParamTypes.js'
import { isNil } from '../internal/utils/isNil.js'
import { ConfigurationProviderOptions } from './ConfigurationProviderOptions.js'

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
        names: factory.names,
        type: factory.type || (typeof factory.token === 'function' ? factory.token : undefined),
        rawProvider: new BeanFactoryProvider(target as unknown as Ctor<T>, method, factory),
        options: factory.options,
        configuredBy: `${target.name}${String(method)}`
      })

      DI.addBean(factory.token, { ...binding })
    }
  }
}
