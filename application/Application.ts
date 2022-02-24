import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { DI } from '@caffeinejs/di'
import { Reflections } from '@caffeinejs/std'
import { globby } from 'globby'
import { Ctor } from './internal/types.js'
import { Vars } from './internal/Vars.js'
import { ScanOptions } from './Scan.js'
import { OnBootstrap } from './bootstrap/OnBootstrap.js'
import { Environment } from './env/Environment.js'
import { YamlConfigurationSourceLoader } from './env/YamlConfigurationSourceLoader.js'

export class Application {
  constructor(private readonly root: Ctor) {}

  static newApplication(root: Ctor) {
    return new Application(root)
  }

  async run() {
    const dir = dirname(fileURLToPath(import.meta.url))
    const namespace = Reflections.get<string | symbol>(Vars.APP_NAMESPACE, this.root) || ''
    const scan = Reflections.get<ScanOptions>(Vars.APP_SCAN, this.root) || { patterns: [] }
    const environment = new Environment([], [new YamlConfigurationSourceLoader()], [])

    if (scan.patterns) {
      const paths = await globby(scan.patterns)

      for (const path of paths) {
        await import(path)
      }
    }

    const bootstrapContainer = new DI(namespace)

    bootstrapContainer.bind(Environment).toValue(environment).refreshableScoped()

    const boot = bootstrapContainer.getMany<OnBootstrap>(Vars.APP_BOOTSTRAP_COMPONENT)

    boot[0].bootstrap(bootstrapContainer)

    const container = bootstrapContainer.newChild()

    container.setup()
    container.initInstances()

    return this
  }
}

export function runApplication(...args: unknown[]) {
  //
}
