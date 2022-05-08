import { R } from '@caffeinejs/std'
import { Vars } from '../internal/Vars.js'

export function Post(path = '/'): MethodDecorator {
  return function (target, propertyKey) {
    R.setMerging(Vars.CONTROLLER_ROUTES, [propertyKey], target.constructor)
    R.setMerging(Vars.ROUTE, { method: 'POST', path }, target.constructor, propertyKey)
  }
}
