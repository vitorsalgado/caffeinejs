import { notNil } from '@caffeinejs/std'
import { ApplicationContext } from '../ApplicationContext.js'
import { ConfigurationSources } from './ConfigurationSources.js'
import { ConfigurationSourceLoader } from './ConfigurationSourceLoader.js'
import { EnvironmentPostProcessor } from './EnvironmentPostProcessor.js'
import { ConfigurationSource } from './ConfigurationSource.js'

export class Environment {
  private readonly _envs = new Map<string, unknown>()
  private readonly _configs = new Map<string, unknown>()
  private readonly _configurationSources
  private _config: object | undefined

  constructor(
    private sources: ConfigurationSource[] = [],
    private readonly _configurationSourceLoaders: ConfigurationSourceLoader[] = [],
    private readonly _postProcessors: EnvironmentPostProcessor[] = [],
  ) {
    this._configurationSources = new ConfigurationSources(sources)
  }

  getEnv<T>(key: string): T | undefined
  getEnv<T>(key: string, defaultValue?: T): T {
    if (typeof defaultValue === 'undefined') {
      return this._envs.get(key) as T
    }

    return (this._envs.get(key) as T) || defaultValue
  }

  hasEnv(key: string): boolean {
    return this._envs.has(key)
  }

  getRequiredEnv<T>(key: string, defaultValue?: T): T | undefined {
    return undefined
  }

  getConfig<T>(key: string, defaultValue?: T): T | undefined {
    return this._configs.get(key) as T | undefined
  }

  getRequiredConfig<T>(key: string, defaultValue?: T): T | undefined {
    return this._configs.get(key) as T | undefined
  }

  configurationSources(): ConfigurationSources {
    return this._configurationSources
  }

  configurations<T extends object>(): T {
    return notNil(this._config) as T
  }

  async refresh(context: ApplicationContext): Promise<void> {
    for (const [key, value] of Object.entries(process.env)) {
      this._envs.set(key, value)
    }

    const loaders: Array<Promise<object>> = []

    for (const source of this._configurationSources.getSources()) {
      const ext = source.source.split('.').pop() || source.loadAsExtension || ''
      const loader = this._configurationSourceLoaders.find(x => x.extensions().includes(ext))

      if (loader) {
        loaders.push(loader.load(source))
      }
    }

    const configurations = await Promise.all(loaders)
    const merged = configurations.reduce((prev, cur) => ({ ...prev, ...cur }), {})

    this._config = merged

    await Promise.all(this._postProcessors.map(x => x.process(this, context)))

    this.toMap(merged)
  }

  private toMap(obj: object, parent?: string): void {
    for (const [key, value] of Object.entries(obj)) {
      const prop = parent ? parent + '.' + key : key

      if (typeof value === 'object' && !Array.isArray(value)) {
        this._configs.set(prop, value)
        this.toMap(value, prop)
      }

      this._configs.set(prop, value)
    }
  }
}
