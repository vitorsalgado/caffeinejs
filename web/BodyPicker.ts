import { Context } from './Context.js'
import { ParameterHandler } from './ParameterHandler.js'

export class BodyPicker implements ParameterHandler {
  handle(ctx: Context): unknown {
    return ctx.request.body
  }
}
