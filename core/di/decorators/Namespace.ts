import { DI } from '../DI.js'

export function Namespace<T>(namespace: string) {
  return function <TFunction extends Function>(target: TFunction) {
    DI.configureDecoratedType<T>(target, { namespace })
  }
}
