import { ConfigurationSource } from './ConfigurationSource.js'

export interface ConfigurationSourceLoader<T extends object = object> {
  extensions(): string[]

  load(source: ConfigurationSource): Promise<T>
}
