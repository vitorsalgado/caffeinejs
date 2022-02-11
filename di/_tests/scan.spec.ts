import { expect } from '@jest/globals'
import { DI } from '../DI.js'

describe('Auto Scan', function () {
  it('ensure scan doesnt fail', async function () {
    expect(() => DI.scan([])).not.toThrow()
  })
})
