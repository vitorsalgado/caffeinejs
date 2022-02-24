import { Bean } from '@caffeinejs/di'
import { Vars } from '../internal/Vars.js'

export function Boot(): ClassDecorator {
  return function (target) {
    if ('bootstrap' in target.prototype) {
    }

    Bean(Vars.APP_BOOTSTRAP_COMPONENT)
  }
}
