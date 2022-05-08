import { R } from './reflection.js'

describe('Reflection', function () {
  describe('pushing item into an empty array', function () {
    it('should init and include the item in the new array', function () {
      const key = 'k'
      const field = 'f'
      const item = 'test'

      interface Spec {
        f: string[]
      }

      class Test {
        test() {}
      }

      R.pushField<Spec, string>(key, field, item, Test, 'test')

      const res = R.getOwn<Spec>(key, Test, 'test')

      expect(res?.f).toEqual([item])
    })
  })
})
