import { Scope } from './Scope.js'
import { Token } from './Token.js'

export interface InjectableOptions {
  dependencies: Token<unknown>[]
  lifecycle: Scope
  props: Map<string, unknown>
}

export function newInjectable(initial?: Partial<InjectableOptions>): InjectableOptions {
  return {
    dependencies: [],
    lifecycle: Scope.SINGLETON,
    props: new Map<string, unknown>(),
    ...initial
  }
}
