import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { DI } from '@caffeinejs/di'
import { Reflections } from '@caffeinejs/std'
import { globby } from 'globby'
import { Ctor } from './internal/types.js'
import { Vars } from './internal/Vars.js'
import { ScanOptions } from './Scan.js'
import { Environment } from './env/Environment.js'
import { YamlSourceLoader } from './env/builtin/YamlSourceLoader.js'
import { JsonSourceLoader } from './env/builtin/JsonSourceLoader.js'
import { Source } from './env/Source.js'
import { ApplicationContext } from './ApplicationContext.js'
import { OnApplicationSetup } from './OnApplicationSetup.js'
import { OnApplicationBootstrap } from './OnApplicationBootstrap.js'
import { Sources } from './env/Sources.js'
import { Adapter } from './Adapter.js'
import { PublicTypes } from './PublicTypes.js'

export class Application {
  protected readonly bootstrap = []

  constructor(private readonly root: Ctor, readonly adapter: Adapter) {}

  static newApplication(root: Ctor) {
    return new Application(root, {} as any)
  }

  async create() {
    const dir = dirname(fileURLToPath(import.meta.url))
    const namespace = Reflections.get<string | symbol>(Vars.APP_NAMESPACE, this.root) || ''
    const scan = Reflections.get<ScanOptions>(Vars.APP_SCAN, this.root) || { patterns: [] }

    if (scan.patterns) {
      const paths = await globby(scan.patterns, { cwd: dir })
      await Promise.all(paths.map(x => import(x)))
    }

    const configSources: Source[] = []
    const onSetupHooks: OnApplicationSetup[] = []
    const containerForSetup = new DI(namespace)

    containerForSetup.addFilters(
      ctx =>
        ctx.binding.configuration === true &&
        (Reflections.hasOwn(Vars.APP_BOOTSTRAP_COMPONENT, ctx.token) ||
          Reflections.hasOwn(Vars.APP_CONFIGURATION_SOURCE, ctx.token)),
    )
    containerForSetup.hooks.on('onBindingRegistered', evt => {
      if (Reflections.hasOwn(Vars.APP_CONFIGURATION_SOURCE, evt.token)) {
        configSources.push(Reflections.getOwn<Source>(Vars.APP_CONFIGURATION_SOURCE, evt.token)!)
      }
    })
    containerForSetup.setup()

    const container = new DI(namespace)
    const environment = this.adapter.setupEnvironment(
      new Environment(new Sources(configSources), [new YamlSourceLoader(), new JsonSourceLoader()], []),
    )
    const applicationContext: ApplicationContext = this.adapter.setupApplicationContext({
      id: 'new',
      container,
      environment,
    })

    await containerForSetup.dispose()
    await environment.refresh(applicationContext)
    await Promise.all(onSetupHooks.map(x => x.onApplicationSetup(applicationContext)))

    container.bind(Environment).toValue(environment).singletonScoped()
    container.bind(PublicTypes.APPLICATION_CONTEXT).toValue(applicationContext).singletonScoped()
    container.setup()

    const bootstrapHooks = container.getMany<OnApplicationBootstrap>('')

    await Promise.all(bootstrapHooks.map(x => x.onApplicationBootstrap(applicationContext)))
    await this.adapter.bootstrap(applicationContext)

    container.initInstances()

    return this
  }

  static Builder = class {}
}

export function runApplication(...args: unknown[]) {
  //
}
