import { Req } from './Request.js'
import { Res } from './Res.js'

export interface Context {
  param: unknown

  request: Req

  response: Res
}
