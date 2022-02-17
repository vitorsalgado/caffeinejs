import { expect } from '@jest/globals'
import { fmtTokenError } from '../errorFmt.js'
import { fmtParamError } from '../errorFmt.js'

describe('Error Fmt', function () {
  it('fmtParamError() should work with classes, functions', function () {
    const fn = () => 'test'

    class Dep {
      prop = 'test'
    }

    const fromFn = fmtParamError(fn, 0)
    const fromClazz = fmtParamError(Dep, 'prop')

    expect(fromFn).toContain("parameter at position '0'")
    expect(fromClazz).toContain(`property 'prop'`)
  })

  it('fmtTokenError()', function () {
    const tk = { token: 'test_token', tokenType: 'test_token_type' }
    const fromTkType = fmtTokenError(tk)

    expect(fromTkType).toContain(`test_token`)
    expect(fromTkType).toContain('test_token_type')
  })
})
