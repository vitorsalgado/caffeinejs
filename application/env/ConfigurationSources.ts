import { notNil } from '@caffeinejs/std'
import { ConfigurationSource } from './ConfigurationSource.js'

export class ConfigurationSources {
  constructor(private readonly configSources: Array<ConfigurationSource>) {}

  get(name: string): ConfigurationSource | unknown {
    return this.configSources.find(x => x.name === notNil(name))
  }

  addFirst(source: ConfigurationSource) {
    this.configSources.unshift(notNil(source))
  }

  addBefore(name: string, source: ConfigurationSource) {
    notNil(name)
    notNil(source)

    const index = this.configSources.findIndex(x => x.name === name)

    if (index < 0) {
      throw new Error('')
    }

    this.configSources.splice(index, 0, source)
  }

  addAfter(name: string, source: ConfigurationSource) {
    notNil(name)
    notNil(source)

    const index = this.configSources.findIndex(x => x.name === name)

    if (index < 0) {
      throw new Error('')
    }

    this.configSources.splice(index + 1, 0, source)
  }

  addLast(source: ConfigurationSource) {
    this.configSources.push(notNil(source))
  }

  remove(name: string) {
    this.configSources.splice(
      this.configSources.findIndex(x => x.name === notNil(name)),
      1,
    )
  }

  clear() {
    this.configSources.splice(0)
  }

  getSources(): ConfigurationSource[] {
    return [...this.configSources]
  }
}
