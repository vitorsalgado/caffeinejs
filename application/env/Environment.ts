import { notNil } from '@caffeinejs/std'
import { ApplicationContext } from '../ApplicationContext.js'
import { Sources } from './Sources.js'
import { SourceLoader } from './SourceLoader.js'
import { EnvironmentPostProcessor } from './EnvironmentPostProcessor.js'

export class Environment {
  private readonly _envs = new Map<string, unknown>()
  private readonly _configs = new Map<string, unknown>()
  private readonly _configurationSources
  private _config: object | undefined

  constructor(
    configurationSources: Sources,
    private readonly _loaders: SourceLoader[] = [],
    private readonly _postProcessors: EnvironmentPostProcessor[] = [],
  ) {
    this._configurationSources = configurationSources
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

  sources(): Sources {
    return this._configurationSources
  }

  addLoader(loader: SourceLoader) {
    this._loaders.push(loader)
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
      const loader = this._loaders.find(x => x.extensions().includes(ext))

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
