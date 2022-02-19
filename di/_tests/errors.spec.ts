import { NoResolutionForTokenError } from '../internal/errors.js'
import { Errors } from '../internal/errors.js'

describe('Errors', function () {
  it('should init error with default code when none is provided', function () {
    const err = new Errors('msg')

    expect(err.message).toEqual('msg')
    expect(err.code).toEqual(Errors.CODE_DEFAULT)
  })

  it('should print the type associated with the token', function () {
    class Dep {}

    const err = new NoResolutionForTokenError({ token: 'test', tokenType: Dep })

    expect(err.message).toContain(Dep.name)
  })
})
