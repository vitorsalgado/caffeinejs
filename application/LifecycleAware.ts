import { Reflections } from '@caffeinejs/std'
import { Vars } from './internal/Vars.js'

export function LifecycleAware(): ClassDecorator {
  return function (target) {
    Reflections.set(Vars.APP_LIFECYCLE_AWARE, true, target)
  }
}
