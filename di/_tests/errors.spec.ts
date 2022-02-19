import { DiError } from '../internal/errors.js'

describe('Errors', function () {
  it('should init error with default code when none is provided', function () {
    const err = new DiError('msg')

    expect(err.message).toEqual('msg')
    expect(err.code).toEqual(DiError.CODE_DEFAULT)
  })
})
