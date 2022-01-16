import { Ctor } from '../types/Ctor.js'
import { DI } from './DI.js'

export function Primary<T>(): ClassDecorator {
  return function (target) {
    DI.configureInjectable(target as unknown as Ctor<T>, {
      primary: true
    })
  }
}
