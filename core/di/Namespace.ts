import { DI } from './DI.js'

export function Namespace<T>(namespace: string): ClassDecorator {
  return function (target) {
    DI.configureInjectable<T>(target, { namespace })
  }
}
