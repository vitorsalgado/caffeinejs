import { R } from '@caffeinejs/std'
import { Injectable } from '@caffeinejs/di'
import { Vars } from '../internal/Vars.js'

export interface ControllerOptions {
  path: string
}

export function Controller(path = '/'): ClassDecorator {
  return function (target) {
    Injectable(Vars.CONTROLLER)(target)
    R.set(Vars.CONTROLLER, { path } as ControllerOptions, target)
  }
}
