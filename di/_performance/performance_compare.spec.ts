import { performance } from 'perf_hooks'
import { expect } from '@jest/globals'
import { yellow, blue } from 'colorette'
import { gray } from 'colorette'
import { Root } from './_fixtures/caf.js'
import { di } from './_fixtures/caf.js'
import { RootSingleton } from './_fixtures/caf.js'
import { inv } from './_fixtures/inversify.js'
import { InvRoot } from './_fixtures/inversify.js'
import { tsy } from './_fixtures/tsy.js'
import { TsyRoot } from './_fixtures/tsy.js'
import { bootstrap } from './_fixtures/nest.js'
import { NestRoot } from './_fixtures/nest.js'

const failIfLess = process.env.TEST_FAIL_PERF === 'true'

const diff = (a: number, b: number) => '~' + String(Math.round(((a - b) / b) * 100)) + '%'

describe('Performance Compare', function () {
  function resolve(times: number, res: () => unknown) {
    const result = {
      avg: -1,
      max: -1,
      min: Number.MAX_SAFE_INTEGER,
      items: [] as { pos: number; total: number }[],
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

      console.log('DI Avg: ' + gray(String(diRes.avg)))
      console.log('DI Singleton Avg: ' + gray(String(diSingletonRes.avg)))

      console.log('Inversify Avg: ' + gray(String(invRes.avg)))
      if (diRes.avg > invRes.avg) {
        console.log(yellow(`PERF: Diff Inversify ${diff(diRes.avg, invRes.avg)}`))
      } else {
        console.log(blue(`PERF: Diff Inversify ${diff(invRes.avg, diRes.avg)}`))
      }

      console.log('Tsyringe Avg: ' + gray(String(tsyRes.avg)))
      if (diRes.avg > tsyRes.avg) {
        console.log(yellow(`PERF: Diff Tsyringe ${diff(diRes.avg, tsyRes.avg)}`))
      } else {
        console.log(blue(`PERF: Diff Tsyringe ${diff(tsyRes.avg, diRes.avg)}`))
      }

      console.log('NestJs Avg: ' + gray(String(nestRes.avg)))
      if (diSingletonRes.avg > nestRes.avg) {
        console.log(yellow(`PERF: Diff NestJs ${diff(diRes.avg, nestRes.avg)}`))
      } else {
        console.log(blue(`PERF: Diff NestJs ${diff(nestRes.avg, diRes.avg)}`))
      }

      if (failIfLess) {
        expect(diRes.avg).toBeLessThan(invRes.avg)
        expect(diRes.avg).toBeLessThan(tsyRes.avg)
        expect(diSingletonRes.avg).toBeLessThan(nestRes.avg)
      }
    })
  })
})
