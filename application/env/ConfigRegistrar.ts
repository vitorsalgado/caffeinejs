import { notNil } from '@caffeinejs/std'
import { ConfigurationSource } from './ConfigurationSource.js'

export namespace ConfigRegistrar {
  const loaders: Array<ConfigurationSource> = []

  export function get(name: string): ConfigurationSource | unknown {
    return loaders.find(x => x.name === notNil(name))
  }

  export function addFirst(source: ConfigurationSource) {
    loaders.unshift(notNil(source))
  }

  export function addBefore(name: string, source: ConfigurationSource) {
    notNil(name)
    notNil(source)

    const index = loaders.findIndex(x => x.name === name)

    if (index < 0) {
      throw new Error('')
    }

    loaders.splice(index, 0, source)
  }

  export function addAfter(name: string, source: ConfigurationSource) {
    notNil(name)
    notNil(source)

    const index = loaders.findIndex(x => x.name === name)

    if (index < 0) {
      throw new Error('')
    }

    loaders.splice(index + 1, 0, source)
  }

  export function addLast(source: ConfigurationSource) {
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
