import { Reflections } from '@caffeinejs/std'
import { Configuration } from '@caffeinejs/di'
import { Vars } from '../internal/Vars.js'
import { ConfigurationSourceOptions } from './ConfigurationSourceOptions.js'

export function ConfigurationSource(filename: string): ClassDecorator {
  return function (target) {
    Configuration()(target)
    Reflections.set(Vars.APP_BOOTSTRAP_COMPONENT, { filename } as ConfigurationSourceOptions, target)
  }
}
