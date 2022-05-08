import { R } from '@caffeinejs/std'
import { Vars } from './internal/Vars.js'
import { Route } from './Route.js'
import { Parameter } from './Parameter.js'
import { ParameterHandler } from './ParameterHandler.js'

function createParamDecorator<V>(handler: ParameterHandler<V>): ParameterDecorator {
  return function (target, propertyKey, index) {
    R.pushField<Route, Parameter>(
      Vars.ROUTE,
      'parameters',
      {
        index,
        picker: false,
        handler,
      },
      target.constructor,
      propertyKey,
    )
  }
}

function pickerFor<V>(picker: ParameterHandler<V>): ParameterDecorator {
  return function (target, propertyKey, index) {
    R.pushField<Route, Parameter>(
      Vars.ROUTE,
      'parameters',
      {
        index,
        picker: true,
        handler: picker,
      },
      target.constructor,
      propertyKey,
    )
  }
}

export const Web = {
  createParamDecorator,
  pickerFor,
}
