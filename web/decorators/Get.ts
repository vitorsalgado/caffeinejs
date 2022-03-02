import { R } from '@caffeinejs/std'

export function Get(): MethodDecorator {
  return function (target, propertyKey, descriptor) {
    R.setMerging('', '', target, propertyKey)
  }
}
