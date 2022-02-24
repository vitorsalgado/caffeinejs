import { Scan } from '../Scan.js'

describe('Application', function () {
  @Scan(['', ''])
  class App {}

  it('should ', async function () {
    await import('./_fixtures/Foo.js')
  })
})
