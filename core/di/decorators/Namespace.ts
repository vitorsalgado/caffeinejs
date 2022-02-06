import { DI } from '../DI.js'

export function Namespace<T>(namespace: string) {
  return function <TFunction extends Function>(target: TFunction) {
    DI.configureInjectable<T>(target, { namespace })
  }
}
