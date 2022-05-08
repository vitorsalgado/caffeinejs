import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { DI } from '@caffeinejs/di'
import { R } from '@caffeinejs/std'
import { globby } from 'globby'
import { Ctor } from './internal/types.js'
import { Vars } from './internal/Vars.js'
import { ScanOptions } from './Scan.js'
import { Environment } from './env/Environment.js'
import { YamlSourceLoader } from './env/builtin/YamlSourceLoader.js'
import { JsonSourceLoader } from './env/builtin/JsonSourceLoader.js'
import { Source } from './env/Source.js'
import { InitContext } from './InitContext.js'
import { OnApplicationSetup } from './OnApplicationSetup.js'
import { OnApplicationBootstrap } from './OnApplicationBootstrap.js'
import { Sources } from './env/Sources.js'
import { Adapter } from './Adapter.js'
import { PublicTypes } from './PublicTypes.js'
import { ApplicationContext } from './ApplicationContext.js'

export class Factory<A extends ApplicationContext> {
  protected readonly bootstrap = []

  constructor(private readonly root: Ctor, readonly adapter: Adapter<A>) {}

  static newApplication(root: Ctor) {
    return new Factory(root, {} as any)
  }

  async create(): Promise<A> {
    const start = Date.now()
    const dir = dirname(fileURLToPath(import.meta.url))
    const namespace = R.get<string | symbol>(Vars.APP_NAMESPACE, this.root) || ''
    const scan = R.get<ScanOptions>(Vars.APP_SCAN, this.root) || { patterns: [] }

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
        (R.hasOwn(Vars.APP_BOOTSTRAP_COMPONENT, ctx.token) || R.hasOwn(Vars.APP_CONFIGURATION_SOURCE, ctx.token)),
    )
    containerForSetup.hooks.on('onBindingRegistered', evt => {
      if (R.hasOwn(Vars.APP_CONFIGURATION_SOURCE, evt.token)) {
        configSources.push(R.getOwn<Source>(Vars.APP_CONFIGURATION_SOURCE, evt.token)!)
      }
    })
    containerForSetup.setup()

    const container = new DI(namespace)
    const environment = await this.adapter.setupEnvironment(
      new Environment(new Sources(configSources), [new YamlSourceLoader(), new JsonSourceLoader()], []),
    )
    const initContext = new InitContext(this.root.name, start, environment, container)

    await containerForSetup.dispose()
    await environment.refresh(initContext)
    await Promise.all(onSetupHooks.map(x => x.onApplicationSetup(initContext)))

    container.bind(Environment).toValue(environment)
    container.bind(PublicTypes.APPLICATION_CONTEXT).toValue(initContext)
    container.setup()

    const bootstrapHooks = container.getMany<OnApplicationBootstrap>('')

    await Promise.all(bootstrapHooks.map(x => x.onApplicationBootstrap(initContext)))
    await this.adapter.bootstrap(initContext)

    const applicationContext = await this.adapter.adapt(initContext)

    container.initInstances()

    return applicationContext
  }

  static Builder = class {}
}

export function runApplication(...args: unknown[]) {
  //
}
