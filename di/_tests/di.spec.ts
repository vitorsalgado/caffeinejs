import { Injectable } from '../decorators/Injectable.js'
import { Named } from '../decorators/Named.js'
import { DI } from '../DI.js'

describe('DI', function () {
  const kTestName = 'test-name'

  @Injectable()
  class Test {}

  @Injectable()
  @Named(kTestName)
  class NamedTest {}

  it('should print the type name when calling toString()', function () {
    const di = DI.setup()
    di.bind('tk100').toValue('test')
    di.bind('tk200').toValue('test')

    const str = di.toString()
    const protoStr = Object.prototype.toString.call(di)

    console.log(str)

    expect(str).toContain('Test')
    expect(str).toContain('NamedTest')
    expect(str).toContain(kTestName)
    expect(str).toContain('tk100')
    expect(str).toContain('tk200')
    expect(protoStr).toEqual('[object DI]')
  })

  it('should return the number of registered components when calling size()', function () {
    const di = DI.setup()

    expect(di.size()).toEqual(2)
  })
})
