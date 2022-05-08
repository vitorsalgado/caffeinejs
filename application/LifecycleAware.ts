import { R } from '@caffeinejs/std'
import { Vars } from './internal/Vars.js'

export function LifecycleAware(): ClassDecorator {
  return function (target) {
    R.set(Vars.APP_LIFECYCLE_AWARE, true, target)
  }
}
