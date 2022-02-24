import { ConfigurationSourceLoader } from '../ConfigurationSourceLoader.js'

export class JsonConfigLoader implements ConfigurationSourceLoader {
  extensions(): string[] {
    return ['.json']
  }

  load(): Promise<unknown> {
    return Promise.resolve(undefined)
  }
}
