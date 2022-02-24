import { Injectable } from '../decorators/Injectable.js'
import { Bag } from '../decorators/Bag.js'
import { bagItem } from '../decorators/Bag.js'
import { DI } from '../DI.js'
import { Optional } from '../decorators/Optional.js'
import { InjectAll } from '../decorators/InjectAll.js'
import { bagItems } from '../decorators/Bag.js'

describe('Injection Bag', function () {
  const kDep = Symbol('test')

  abstract class Base {}

  @Injectable()
  class Impl1 extends Base {}

  @Injectable()
  class Impl2 extends Base {}

  @Injectable()
  class Dep1 {}

  class Dep2 {}

  @Injectable(kDep)
  class Dep3 {}

  @Injectable()
  class Root {
    constructor(
      @Bag([
        bagItem(Dep1),
        { token: Dep2, optional: true, key: 'dep2' },
        bagItem(kDep, 'dep3'),
        bagItem(Base, 'base', { multiple: true }),
      ])
      readonly args: { dep1: Dep1; dep2?: Dep2; dep3: Dep3; base: Base[] },
    ) {}
  }

  @Injectable()
  class DiffTypes {
    constructor(
      @Bag([bagItem(Dep1), { token: Dep2, optional: true, key: 'dep2' }])
      readonly args: { dep1: Dep1 },
      @Bag([bagItem(kDep, 'dep3')])
      readonly other: { dep3: Dep3 },
      @Optional() readonly dep2: Dep2 | undefined,
      @InjectAll(Base) readonly base: Base[],
      @Bag([bagItems(Base)])
      readonly another: { base: Base[] },
    ) {}
  }

  it('should resolve argument bag in same well it would resolve normal args', function () {
    const di = DI.setup()
    const root = di.get(Root)

    expect(root).toBeInstanceOf(Root)
    expect(root.args.dep1).toBeInstanceOf(Dep1)
    expect(root.args.dep2).toBeUndefined()
    expect(root.args.dep3).toBeInstanceOf(Dep3)
    expect(root.args.base).toHaveLength(2)
    expect(root.args.base.every(x => x instanceof Base)).toBeTruthy()
  })

  it('should resolve constructor mixing different argument types', function () {
    const di = DI.setup()
    const diff = di.get(DiffTypes)

    expect(diff).toBeInstanceOf(DiffTypes)
    expect(diff.args.dep1).toBeInstanceOf(Dep1)
    expect(diff.dep2).toBeUndefined()
    expect(diff.other.dep3).toBeInstanceOf(Dep3)
    expect(diff.base).toHaveLength(2)
    expect(diff.base.every(x => x instanceof Base)).toBeTruthy()
    expect(diff.another.base).toHaveLength(2)
    expect(diff.another.base.every(x => x instanceof Base)).toBeTruthy()
  })
})
