import { DI } from './DI.js'

export interface ConditionContext {
  di: DI
}

export type Conditional = (ctx: ConditionContext) => boolean
