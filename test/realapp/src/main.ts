import 'reflect-metadata'

import * as Path from 'path'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { createConnection } from 'typeorm'
import { getConnection } from 'typeorm'
import { DI } from '@caffeinejs/di'
import { UserRepository } from './users/UserRepository.js'
import { User } from './users/User.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

await DI.scan([Path.join(__dirname, './users/mod.js')])
const di = DI.setup()

await createConnection({
  name: 'test',
  type: 'mongodb',
  authSource: 'admin',
  url: 'mongodb://root:root@192.168.64.2:27017/local',
  entities: [User]
})

getConnection('test')

di.bootstrap()

const repo = di.get(UserRepository)

await repo.save({ name: 'hello world' })
