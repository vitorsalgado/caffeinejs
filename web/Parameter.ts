import { ParameterHandler } from './ParameterHandler.js'

export interface Parameter<V = unknown> {
  index: number
  picker: boolean
  handler: ParameterHandler<V>
}
