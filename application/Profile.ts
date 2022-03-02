import { Reflections } from '@caffeinejs/std'
import { notNil } from '@caffeinejs/std'
import { Vars } from './internal/Vars.js'

export function Profile(profile: string): ClassDecorator {
  return function (target) {
    Reflections.set(Vars.APP_PROFILE, notNil(profile), target)
  }
}
