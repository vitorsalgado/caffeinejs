import { performance } from 'perf_hooks'
import { DI } from '../DI.js'
import { Injectable } from '../decorators/Injectable.js'
import { PostConstruct } from '../decorators/PostConstruct.js'
import { Transient } from '../decorators/Transient.js'
import { Inject } from '../decorators/Inject.js'
import { Container } from '../Container.js'

describe('Performance', () => {
  const kVal = Symbol('perf_val')

  abstract class Repo {}

  @Injectable()
  @Transient()
  class Dep {}

  @Injectable()
  @Transient()
  class SomeRepo extends Repo {}

  @Injectable()
  @Transient()
  class Svc {
    @Inject(kVal)
    val!: string

    dep!: Dep

    constructor(readonly repo: Repo) {}

    @PostConstruct()
    init() {}

    @Inject()
    setDep(dep: Dep) {
      this.dep = dep
    }
  }

  @Injectable()
  @Transient()
  class Root {
    constructor(readonly dep: Dep) {}
  }

  class Lonely {}

  function bindTheTotalOf(times: number) {
    const result = {
      di: DI.setup(),
      register: -1,
    }

    let i: number

    for (i = 0; i < times; i++) {
      const start = performance.now()

      result.di.bind(`ID_${i}`).toValue({ test: i })
      result.di.bind(kVal).toValue('test')
      result.di.bind(Lonely).toSelf()

      const end = performance.now()

      result.register = end - start
    }

    return result
  }

  function resolveTimes(di: Container, times: number) {
    const result = {
      avg: -1,
      max: -1,
      min: Number.MAX_SAFE_INTEGER,
      items: [] as { pos: number; total: number }[],
    }

    let i: number

    for (i = 0; i < times; i++) {
      const start = performance.now()

      di.get(`ID_${times}`)
      di.get(Root)
      di.get(Svc)

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

  describe('bindings', function () {
    it('should bind 1 time in less than 1 ms', () => {
      const res = bindTheTotalOf(1)
      expect(res.register).toBeLessThan(1)
    })

    it('should bind 5 times in less than 1 ms', () => {
      const res = bindTheTotalOf(5)
      expect(res.register).toBeLessThan(1)
    })

    it('should bind 1K times in less than 1 ms', () => {
      const res = bindTheTotalOf(1000)
      expect(res.register).toBeLessThan(1)
    })

    it('should bind 5K times in less than 1 ms', () => {
      const res = bindTheTotalOf(5000)
      expect(res.register).toBeLessThan(1)
    })
  })

  describe('bindings + resolutions', function () {
    it('should bind and resolve 1k times in less than 1 ms', () => {
      const di = bindTheTotalOf(1000).di
      const res = resolveTimes(di, 1000)

      expect(res.avg).toBeLessThan(1)
    })

    it('should bind and resolve 3k times in less than 1 ms', () => {
      const di = bindTheTotalOf(3000).di
      const res = resolveTimes(di, 3000)

      expect(res.avg).toBeLessThan(1)
    })

    it('should bind and resolve 5k times in less than 1 ms', () => {
      const di = bindTheTotalOf(5000).di
      const res = resolveTimes(di, 5000)

      expect(res.avg).toBeLessThan(1)
    })

    it('should bind and resolve 10k times in less than 1 ms', () => {
      const di = bindTheTotalOf(10000).di
      const res = resolveTimes(di, 10000)

      expect(res.avg).toBeLessThan(1)
    })
  })
})
