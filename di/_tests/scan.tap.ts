import 'reflect-metadata'
import * as Path from 'path'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import tap from 'tap'
import { DI } from '../DI.js'

const describe = tap.test
const it = describe

describe('Auto Scan', async function (t) {
  it('should scan', async function (t) {
    const modulesDir = dirname(fileURLToPath(import.meta.url))
    const paths: string[] = [
      './fixtures/scan/Bar.js',
      './fixtures/scan/Foo.js',
      './fixtures/scan/Conf.js',
      './fixtures/scan/NonExp.js'
    ]

    await DI.scan(paths.map(x => Path.join(modulesDir, x)))

    const di = DI.setup()
    const size = di.size()

    t.equal(size, 6)
    t.end()
  })
})
