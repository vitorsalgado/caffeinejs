import { notNil } from '@caffeinejs/std'
import { Source } from './Source.js'

export class Sources {
  constructor(private readonly configSources: Array<Source> = []) {}

  get(name: string): Source | unknown {
    return this.configSources.find(x => x.name === notNil(name))
  }

  addFirst(source: Source) {
    this.configSources.unshift(notNil(source))
  }

  addBefore(name: string, source: Source) {
    notNil(name)
    notNil(source)

    const index = this.configSources.findIndex(x => x.name === name)

    if (index < 0) {
      throw new Error('')
    }

    this.configSources.splice(index, 0, source)
  }

  addAfter(name: string, source: Source) {
    notNil(name)
    notNil(source)

    const index = this.configSources.findIndex(x => x.name === name)

    if (index < 0) {
      throw new Error('')
    }

    this.configSources.splice(index + 1, 0, source)
  }

  addLast(source: Source) {
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

  getSources(): Source[] {
    return [...this.configSources]
  }
}
