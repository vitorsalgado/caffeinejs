import { NoResolutionForTokenError } from '../DiError.js'
import { DiError } from '../DiError.js'

describe('Errors', function () {
  it('should init error with default code when none is provided', function () {
    const err = new DiError('msg')

    expect(err.message).toEqual('msg')
    expect(err.code).toEqual(DiError.CODE_DEFAULT)
  })

  it('should print the type associated with the token', function () {
    class Dep {}

    const err = new NoResolutionForTokenError({ token: 'test', tokenType: Dep })

    expect(err.message).toContain(Dep.name)
  })
})
