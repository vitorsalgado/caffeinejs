import 'reflect-metadata'
import * as Path from 'path'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import tap from 'tap'
import { DI } from '../DI.js'

tap.test('Auto Scan', async function (t) {
  const modulesDir = dirname(fileURLToPath(import.meta.url))
  const paths: string[] = [
    './fixtures/scan2/Bar.js',
    './fixtures/scan2/Foo.js',
    './fixtures/scan2/Conf.js',
    './fixtures/scan2/NonExp.js'
  ]

  await DI.scan(paths.map(x => Path.join(modulesDir, x)))

  const di = DI.setup()
  const size = di.size()

  t.equal(size, 6)
  t.end()
})
