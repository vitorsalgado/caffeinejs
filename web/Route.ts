import { Parameter } from './Parameter.js'

export interface Route {
  method: string
  path: string
  parameters: Parameter[]
}
