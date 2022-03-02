import { notNil } from '@caffeinejs/std'
import { Source } from './Source.js'

export namespace ConfigRegistrar {
  const loaders: Array<Source> = []

  export function get(name: string): Source | unknown {
    return loaders.find(x => x.name === notNil(name))
  }

  export function addFirst(source: Source) {
    loaders.unshift(notNil(source))
  }

  export function addBefore(name: string, source: Source) {
    notNil(name)
    notNil(source)

    const index = loaders.findIndex(x => x.name === name)

    if (index < 0) {
      throw new Error('')
    }

    loaders.splice(index, 0, source)
  }

  export function addAfter(name: string, source: Source) {
    notNil(name)
    notNil(source)

    const index = loaders.findIndex(x => x.name === name)

    if (index < 0) {
      throw new Error('')
    }

    loaders.splice(index + 1, 0, source)
  }

  export function addLast(source: Source) {
    loaders.push(notNil(source))
  }

  export function remove(name: string) {
    loaders.splice(
      loaders.findIndex(x => x.name === notNil(name)),
      1,
    )
  }

  export function clear() {
    loaders.splice(0)
  }

  export function getLoaders() {
    return [...loaders]
  }
}
