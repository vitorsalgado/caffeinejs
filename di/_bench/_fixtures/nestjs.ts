import { Injectable } from '@nestjs/common'
import { Scope } from '@nestjs/common'
import { Inject } from '@nestjs/common'
import { Module } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { Global } from '@nestjs/common'

export interface Nest {
  get(): string
}

@Injectable()
@Global()
export class NestRepository {
  find() {
    return 'data'
  }
}

@Injectable()
@Global()
export class NestService {
  constructor(readonly repository: NestRepository) {}
}

@Injectable()
@Global()
export class NestRoot {
  constructor(readonly service: NestService) {}
}

@Injectable({ scope: Scope.TRANSIENT })
@Global()
export class NestDep implements Nest {
  get(): string {
    return 'dep'
  }
}

@Injectable()
@Global()
export class NestTransientRoot {
  constructor(@Inject('nest') readonly dep: Nest) {}
}

@Module({
  providers: [
    {
      useClass: NestDep,
      provide: 'nest'
    },
    NestTransientRoot,
    NestRoot,
    NestDep,
    NestService,
    NestRepository
  ]
})
export class App {}

export async function bootstrap() {
  return await NestFactory.createApplicationContext(App, { logger: false })
}
