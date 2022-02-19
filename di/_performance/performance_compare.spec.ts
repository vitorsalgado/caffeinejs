import { performance } from 'perf_hooks'
import { expect } from '@jest/globals'
import { Root } from './_fixtures/caf.js'
import { di } from './_fixtures/caf.js'
import { RootSingleton } from './_fixtures/caf.js'
import { inv } from './_fixtures/inversify.js'
import { InvRoot } from './_fixtures/inversify.js'
import { tsy } from './_fixtures/tsy.js'
import { TsyRoot } from './_fixtures/tsy.js'
import { bootstrap } from './_fixtures/nest.js'
import { NestRoot } from './_fixtures/nest.js'

describe('Performance Compare', function () {
  function resolve(times: number, res: () => unknown) {
    const result = {
      avg: -1,
      max: -1,
      min: Number.MAX_SAFE_INTEGER,
      items: [] as { pos: number; total: number }[]
    }

    let i: number

    for (i = 0; i < times; i++) {
      const start = performance.now()

      res()

      const end = performance.now()
      const total = end - start

      if (total < result.min) {
        result.min = total
      }
      if (total > result.max) {
        result.max = total
      }

      result.items.push({ pos: i, total })
    }

    result.avg = result.items.reduce((p, c) => p + c.total, 0) / result.items.length
    result.items.sort((a, b) => b.total - a.total)

    return result
  }

  it('should resolve 15k times in less time then the others', async () => {
    const times = 15000

    return bootstrap().then(nestApp => {
      expect(inv.get(InvRoot)).toBeInstanceOf(InvRoot)
      expect(tsy.resolve(TsyRoot)).toBeInstanceOf(TsyRoot)
      expect(di.get(Root)).toBeInstanceOf(Root)

      const invRes = resolve(times, () => inv.get(InvRoot))
      const tsyRes = resolve(times, () => tsy.resolve(TsyRoot))
      const diRes = resolve(times, () => di.get(Root))
      const diSingletonRes = resolve(times, () => di.get(RootSingleton))
      const nestRes = resolve(times, () => nestApp.get(NestRoot))

      console.log('DI Avg: ' + String(diRes.avg))
      console.log('DI Singleton Avg: ' + String(diSingletonRes.avg))
      console.log('Inversify Avg: ' + String(invRes.avg))
      console.log('Tsyringe Avg: ' + String(tsyRes.avg))
      console.log('NestJs Avg: ' + String(nestRes.avg))

      expect(diRes.avg).toBeLessThan(invRes.avg)
      expect(diRes.avg).toBeLessThan(tsyRes.avg)
      expect(diSingletonRes.avg).toBeLessThan(nestRes.avg)
    })
  })
})
