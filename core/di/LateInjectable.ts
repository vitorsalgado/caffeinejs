import { Ctor } from '../types/Ctor.js'
import { DI } from './DI.js'
import { Token } from './Token.js'
import { getParamTypes } from './utils/getParamTypes.js'

export function LateInjectable<T>(): ClassDecorator {
  return function (target) {
    const dependencies = getParamTypes(target) as Token<unknown>[]

    DI.configureInjectable(target as unknown as Ctor<T>, {
      dependencies,
      provider: { useClass: target as unknown as Ctor<T> },
      autoInit: false
    })
  }
}
