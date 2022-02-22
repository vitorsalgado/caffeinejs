import 'reflect-metadata'
import cronometro from 'cronometro'
import { printResults } from '@caffeinejs/internal-perf'
import { errorThreshold } from './vars.js'
import { connections } from './vars.js'
import { TsyRoot } from './_fixtures/tsyringe.js'
import { TsyTransientRoot } from './_fixtures/tsyringe.js'
import { tsyringeContainer } from './_fixtures/tsyringe.js'
import { inversifyContainer } from './_fixtures/inversify.js'
import { InvRoot } from './_fixtures/inversify.js'
import { InvTransientRoot } from './_fixtures/inversify.js'
import { di } from './_fixtures/di.js'
import { CafRoot } from './_fixtures/di.js'
import { CafTransientRoot } from './_fixtures/di.js'
import { bootstrap } from './_fixtures/nestjs.js'
import { NestRoot } from './_fixtures/nestjs.js'
import { NestTransientRoot } from './_fixtures/nestjs.js'
import { loopCtx } from './_fixtures/loopback.js'
import { LoopRoot } from './_fixtures/loopback.js'
import { LoopTransientRoot } from './_fixtures/loopback.js'

const nestApp = await bootstrap()

cronometro(
  {
    tsyringe() {
      tsyringeContainer.resolve(TsyRoot)
      tsyringeContainer.resolve(TsyTransientRoot)
    },

    inversify() {
      inversifyContainer.get(InvRoot)
      inversifyContainer.get(InvTransientRoot)
    },

    di() {
      di.get(CafRoot)
      di.get(CafTransientRoot)
    },

    loopBack() {
      loopCtx.getSync(LoopRoot.name)
      loopCtx.getSync(LoopTransientRoot.name)
    },

    nestjs() {
      nestApp.get(NestRoot)
      return nestApp.resolve(NestTransientRoot)
    },
  },
  {
    iterations: 5000,
    errorThreshold,
  },
  async (err, results) => {
    if (err) {
      throw err
    }

    console.log(printResults(connections, results))

    await nestApp.close()
  },
)
