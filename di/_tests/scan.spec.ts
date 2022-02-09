import * as Path from 'path'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { DI } from '../DI.js'

describe('Auto Scan', function () {
  it('should ', async function () {
    const modulesDir = dirname(fileURLToPath(import.meta.url))
    const paths: string[] = [
      './fixtures/scan/Bar'
      //'./fixtures/scan/Foo',
      //'./fixtures/scan/Conf',
      //'./fixtures/scan/NonExp'
    ]

    await DI.scan(paths.map(x => Path.join(modulesDir, x)))

    const di = DI.setup()
    const size = di.size()

    expect(size).toEqual(6)
  })
})
