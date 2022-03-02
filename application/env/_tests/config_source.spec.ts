// import { beforeEach } from '@jest/globals'
// import { afterEach } from '@jest/globals'
// import { expect } from '@jest/globals'
// import { Json } from '@caffeinejs/std'
// import { ConfigurationSourceLoader } from '../ConfigurationSourceLoader.js'
// import { ConfigRegistrar } from '../ConfigRegistrar.js'
// import { ConfigurationSource } from '../ConfigurationSource.js'
// import { Environment } from '../Environment.js'
//
// describe('Configuration loader', function () {
//   describe('when configuring', function () {
//     const environment = new Environment()
//
//     class One implements ConfigurationSourceLoader {
//       readonly name = 'one'
//
//       load(source: ConfigurationSource): Promise<Json> {
//         return Promise.resolve({ test: 'one' })
//       }
//
//       extensions(): string[] {
//         return []
//       }
//     }
//
//     class Two implements ConfigurationSourceLoader {
//       readonly name = 'two'
//
//       load(source: ConfigurationSource): Promise<Json> {
//         return Promise.resolve({ test: 'two' })
//       }
//
//       extensions(): string[] {
//         return []
//       }
//     }
//
//     class Three implements ConfigurationSourceLoader {
//       readonly name = 'three'
//
//       load(source: ConfigurationSource): Promise<Json> {
//         return Promise.resolve({ test: 'three' })
//       }
//
//       extensions(): string[] {
//         return []
//       }
//     }
//
//     class Four implements ConfigurationSourceLoader {
//       readonly name = 'four'
//
//       load(source: ConfigurationSource): Promise<Json> {
//         return Promise.resolve({ test: 'one' })
//       }
//
//       extensions(): string[] {
//         return []
//       }
//     }
//
//     class NewOne implements ConfigurationSourceLoader {
//       readonly name = 'new_one'
//
//       load(source: ConfigurationSource): Promise<Json> {
//         return Promise.resolve({ test: 'new_one' })
//       }
//
//       extensions(): string[] {
//         return []
//       }
//     }
//
//     beforeEach(() => {
//       ConfigRegistrar.addLast(new One())
//       ConfigRegistrar.addLast(new Two())
//       ConfigRegistrar.addLast(new Three())
//       ConfigRegistrar.addLast(new Four())
//     })
//
//     afterEach(() => ConfigRegistrar.clear())
//
//     it('should add item first', function () {
//       ConfigRegistrar.addFirst(new NewOne())
//
//       const sources = ConfigRegistrar.getLoaders()
//
//       expect(sources).toHaveLength(5)
//       expect(sources[0].name).toEqual('new_one')
//       expect(ConfigRegistrar.get('new_one')).toBeInstanceOf(NewOne)
//     })
//
//     it('should add loader before an existing item in the middle of the list', function () {
//       ConfigRegistrar.addBefore('three', new NewOne())
//
//       const sources = ConfigRegistrar.getLoaders()
//
//       expect(sources).toHaveLength(5)
//       expect(sources[2].name).toEqual('new_one')
//       expect(ConfigRegistrar.get('new_one')).toBeInstanceOf(NewOne)
//     })
//
//     it('should add loader before the first item', function () {
//       ConfigRegistrar.addBefore('one', new NewOne())
//
//       const sources = ConfigRegistrar.getLoaders()
//
//       expect(sources).toHaveLength(5)
//       expect(sources[0].name).toEqual('new_one')
//     })
//
//     it('should add loader after an existing item in the middle of the list', function () {
//       ConfigRegistrar.addAfter('three', new NewOne())
//
//       const sources = ConfigRegistrar.getLoaders()
//
//       expect(sources).toHaveLength(5)
//       expect(sources[3].name).toEqual('new_one')
//     })
//
//     it('should add loader after the last item', function () {
//       ConfigRegistrar.addAfter('four', new NewOne())
//
//       const sources = ConfigRegistrar.getLoaders()
//
//       expect(sources).toHaveLength(5)
//       expect(sources[4].name).toEqual('new_one')
//     })
//
//     it('should remove item', function () {
//       ConfigRegistrar.remove('two')
//     })
//
//     it('should fail when trying to add a loader before or after a nonexistent one', function () {
//       expect(() => ConfigRegistrar.addAfter('none', new NewOne())).toThrow()
//       expect(() => ConfigRegistrar.addBefore('none', new NewOne())).toThrow()
//     })
//   })
// })
